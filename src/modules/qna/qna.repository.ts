import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class QnARepository {
  constructor(private readonly dbService: DatabaseService) {}

  async searchCosineByQuery(
    embedding: string,
    businessId: string | undefined,
    limit: number,
  ) {
    const client = await this.dbService.getClient();
    try {
      const query = businessId
        ? `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price, (1 - (embedding <=> $1)) as cosine_similarity 
           FROM products 
           WHERE "businessId" = $2
           ORDER BY cosine_similarity DESC 
           LIMIT $3`
        : `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price, (1 - (embedding <=> $1)) as cosine_similarity 
           FROM products 
           ORDER BY cosine_similarity DESC 
           LIMIT $2`;

      const params = businessId
        ? [embedding, businessId, limit]
        : [embedding, limit];
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async searchHybridByQuery(
    embedding: string,
    searchText: string,
    businessId: string | undefined,
    limit: number,
  ) {
    const client = await this.dbService.getClient();
    try {
      // Trim businessId to prevent UUID format errors
      const trimmedBusinessId = businessId?.trim();

      // Create a tsquery from the search text
      const processedText = searchText
        .replace(/[&|!:*()]/g, ' ') // Remove special characters
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .join(' & ');

      const tsQuery = processedText
        ? `to_tsquery('english', '${processedText}')`
        : "to_tsquery('')";

      const query = trimmedBusinessId
        ? `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price,
           (1 - (embedding <=> $1)) * 0.7 + 
           CASE 
             WHEN ts_rank(to_tsvector('english', title || ' ' || description), ${tsQuery}) > 0 
             THEN ts_rank(to_tsvector('english', title || ' ' || description), ${tsQuery}) * 0.3
             ELSE 0
           END as hybrid_score
           FROM products
           WHERE "businessId" = $2
           ORDER BY hybrid_score DESC
           LIMIT $3`
        : `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price,
           (1 - (embedding <=> $1)) * 0.7 + 
           CASE 
             WHEN ts_rank(to_tsvector('english', title || ' ' || description), ${tsQuery}) > 0 
             THEN ts_rank(to_tsvector('english', title || ' ' || description), ${tsQuery}) * 0.3
             ELSE 0
           END as hybrid_score
           FROM products
           ORDER BY hybrid_score DESC
           LIMIT $2`;

      const params = trimmedBusinessId
        ? [embedding, trimmedBusinessId, limit]
        : [embedding, limit];

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // async searchCosineByQuery(
  //   embedding: string,
  //   businessId: string | undefined,
  //   limit: number,
  // ) {
  //   const client = await this.dbService.getClient();
  //   try {
  //     const query = businessId
  //       ? `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price, (1 - (embedding <=> $1)) as cosine_similarity
  //        FROM products
  //        WHERE "businessId" = $2
  //        ORDER BY cosine_similarity DESC
  //        LIMIT $3`
  //       : `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price, (1 - (embedding <=> $1)) as cosine_similarity
  //        FROM products
  //        ORDER BY cosine_similarity DESC
  //        LIMIT $2`;

  //     const params = businessId
  //       ? [embedding, businessId, limit]
  //       : [embedding, limit];
  //     const result = await client.query(query, params);
  //     return result.rows;
  //   } finally {
  //     client.release();
  //   }
  // }

  async searchHybridByQuestion(
    embedding: string,
    question: string,
    botId: string | undefined,
    limit: number,
  ) {
    const client = await this.dbService.getClient();
    try {
      const query = botId
        ? `SELECT id, question, answer, "botId", "createdAt", "updatedAt",
           (embedding <=> $1) * 0.7 + 
           (1 - similarity(question, $2::text)) * 0.3 as hybrid_score
           FROM question_n_answers
           WHERE "botId" = $3
           ORDER BY hybrid_score
           LIMIT $4`
        : `SELECT id, question, answer, "botId", "createdAt", "updatedAt",
           (embedding <=> $1) * 0.7 + 
           (1 - similarity(question, $2::text)) * 0.3 as hybrid_score
           FROM question_n_answers
           ORDER BY hybrid_score
           LIMIT $3`;

      const params = botId
        ? [embedding, question, botId, limit]
        : [embedding, question, limit];

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // async searchHybridByQuery(
  //   embedding: string,
  //   searchText: string,
  //   businessId: string | undefined,
  //   limit: number,
  // ) {
  //   const client = await this.dbService.getClient();
  //   try {
  //     // Trim businessId to prevent UUID format errors
  //     const trimmedBusinessId = businessId?.trim();

  //     const query = businessId
  //       ? `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price,
  //          (embedding <=> $1) * 0.7 +
  //          (1 - similarity(title || ' ' || description, $2::text)) * 0.3 as hybrid_score
  //          FROM products
  //          WHERE "businessId" = $3
  //          ORDER BY hybrid_score
  //          LIMIT $4`
  //       : `SELECT id, category, brand, cluster_id, title, description, spectablecontent, price,
  //          (embedding <=> $1) * 0.7 +
  //          (1 - similarity(title || ' ' || description, $2::text)) * 0.3 as hybrid_score
  //          FROM products
  //          ORDER BY hybrid_score
  //          LIMIT $3`;

  //     const params = trimmedBusinessId
  //       ? [embedding, searchText, trimmedBusinessId, limit]
  //       : [embedding, searchText, limit];

  //     const result = await client.query(query, params);
  //     return result.rows;
  //   } finally {
  //     client.release();
  //   }
  // }

  async beginTransaction() {
    const client = await this.dbService.getClient();
    await client.query('BEGIN');
    return client;
  }

  async commitTransaction(client: any) {
    await client.query('COMMIT');
  }

  async rollbackTransaction(client: any) {
    await client.query('ROLLBACK');
  }

  async insertProduct(
    id: string,
    category: string,
    cluster_id: string,
    brand: string,
    title: string,
    description: string,
    price: string,
    specTableContent: string,
    embedding: any,
    businessId = '75e22ed8-d8c8-47db-81c9-97304068311c',
  ): Promise<any> {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        `INSERT INTO products (
          id, category, cluster_id, brand, title, description, 
          price, "spectablecontent", embedding, "businessId"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          cluster_id = EXCLUDED.cluster_id,
          brand = EXCLUDED.brand,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          "spectablecontent" = EXCLUDED."spectablecontent",
          embedding = EXCLUDED.embedding
        RETURNING *`,
        [
          id,
          category,
          cluster_id,
          brand,
          title,
          description,
          price,
          specTableContent,
          embedding,
          businessId,
        ],
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async searchProductsBySimilarity(embedding: number[], limit: number) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT *, (embedding <=> $1) as similarity FROM products ORDER BY similarity LIMIT $2',
        [embedding, limit],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async searchProductsByCosine(embedding: number[], limit: number) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT *, (1 - (embedding <=> $1)) as cosine_similarity FROM products ORDER BY cosine_similarity DESC LIMIT $2',
        [embedding, limit],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async searchProductsHybrid(
    embedding: number[],
    searchText: string,
    limit: number,
  ) {
    const client = await this.dbService.getClient();
    try {
      const query = `
        SELECT *,
        (embedding <=> $1) * 0.7 + 
        (1 - similarity(title || ' ' || description, $2::text)) * 0.3 as hybrid_score
        FROM products
        ORDER BY hybrid_score
        LIMIT $3
      `;

      const result = await client.query(query, [embedding, searchText, limit]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findProductById(id: string) {
    const client = await this.dbService.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [id],
      );
      if (result.rows.length === 0) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateProduct(
    id: string,
    updateData: Partial<{
      category: string;
      cluster_id: string;
      brand: string;
      title: string;
      description: string;
      price: string;
      specTableContent: string;
      embedding: number[];
    }>,
  ) {
    const client = await this.dbService.getClient();
    try {
      const updateFields = [];
      const updateValues = [];

      Object.entries(updateData).forEach(([key, value], index) => {
        if (value !== undefined) {
          updateFields.push(`"${key}" = $${index + 1}`);
          updateValues.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields provided to update');
      }

      const query = `
        UPDATE products 
        SET ${updateFields.join(', ')}
        WHERE id = $${updateValues.length + 1}
        RETURNING *
      `;

      updateValues.push(id);
      const result = await client.query(query, updateValues);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
