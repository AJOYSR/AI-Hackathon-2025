/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  QnaListResponseDto,
  SearchVectorByQueryDto,
  SearchVectorByQuestionDto,
} from './dto/qna.dto';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { QnARepository } from './qna.repository';
import { GeminiService } from '../gemini/gemini.service';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import { LocalAIService } from '../local-ai/local-ai.service';

@Injectable()
export class QnAService {
  constructor(
    private readonly qnaRepo: QnARepository,
    private readonly apiResponse: APIResponse,
    private readonly geminiService: GeminiService,
    private readonly localAiService: LocalAIService,
  ) {}

  async searchCosineByQuery(searchDto: SearchVectorByQueryDto, intent: any) {
    const { businessId, limit = 5 } = searchDto;

    const embeddingRes = await this.geminiService.generateEmbeddings(
      intent.title,
    );
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchCosineByQuery(
      embedding,
      businessId,
      limit,
    );
    return this.apiResponse.success(results);
  }

  async searchHybridByQuestion(searchDto: SearchVectorByQuestionDto) {
    const { question, botId, limit = 5 } = searchDto;
    // const embeddingRes = await this.aiResponse.generateEmbeddings(question);
    const embeddingRes = await this.geminiService.generateEmbeddings(question);
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchHybridByQuestion(
      embedding,
      question,
      botId,
      limit,
    );
    return this.apiResponse.success(results);
  }

  async searchHybridByQuery(searchDto: SearchVectorByQueryDto, intent: any) {
    const { question, businessId, limit = 5 } = searchDto;

    const embeddingRes = await this.geminiService.generateEmbeddings(
      intent.title,
    );
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchHybridByQuery(
      embedding,
      intent.title,
      businessId,
      limit,
    );
    return this.apiResponse.success(results);
  }
  async bestPossibleResultByQuery(
    searchDto: SearchVectorByQuestionDto,
  ): Promise<QnaListResponseDto> {
    // Get results from both methods
    // Get intent and clean up the response
    const rawIntent = await this.geminiService.returnIntent(searchDto.question);
    const intentJson = rawIntent.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const intent = JSON.parse(intentJson);
    const cosineResults = await this.searchCosineByQuery(searchDto, intent);
    const hybridResults = await this.searchHybridByQuery(searchDto, intent);

    // Combine and re-rank
    const combinedResults = new Map();

    // Process cosine results
    cosineResults.data.forEach((item) => {
      combinedResults.set(item.id, {
        ...item,
        cosine_score: item.cosine_similarity,
        hybrid_score: 0,
        combined_score: item.cosine_similarity * 0.5,
      });
    });

    // Process hybrid results
    hybridResults.data.forEach((item) => {
      if (combinedResults.has(item.id)) {
        // Update existing entry
        const existing = combinedResults.get(item.id);
        existing.hybrid_score = 1 - item.hybrid_score; // Convert to similarity
        existing.combined_score += existing.hybrid_score * 0.5;
      } else {
        // Add new entry
        combinedResults.set(item.id, {
          ...item,
          cosine_score: 0,
          hybrid_score: 1 - item.hybrid_score, // Convert to similarity
          combined_score: (1 - item.hybrid_score) * 0.5,
        });
      }
    });

    // Sort by combined score and apply base filtering
    // FIX: Using more reasonable filtering conditions - only check combined_score
    const sortedResults = Array.from(combinedResults.values())
      .filter((result) => result.combined_score > 0.4)
      .sort((a, b) => b.combined_score - a.combined_score)
      .slice(0, searchDto.limit || 5);

    // Apply category filtering if applicable
    let categoryFilteredResults = sortedResults;
    if (intent.category && intent.category !== 'Other') {
      categoryFilteredResults = sortedResults.filter(
        (result) => result.category === intent.category,
      );
    }

    // FIX: Apply price filtering in one place only
    let finalResults = categoryFilteredResults;
    if (intent.min_price || intent.max_price) {
      finalResults = categoryFilteredResults.filter((result) => {
        // Skip price filtering if price is empty or not a valid number
        if (!result.price) return true;

        const price = parseFloat(result.price);
        if (isNaN(price)) return true;

        const minPrice = intent.min_price ? parseFloat(intent.min_price) : null;

        const maxPrice = intent.max_price ? parseFloat(intent.max_price) : null;

        if (minPrice !== null && maxPrice !== null) {
          return price >= minPrice && price <= maxPrice;
        } else if (minPrice !== null) {
          return price >= minPrice;
        } else if (maxPrice !== null) {
          return price <= maxPrice;
        }
        return true;
      });
    }

    return this.apiResponse.success(finalResults);
  }

  async importProducts() {
    const csvFilePath = './data/wdc_products_2017.csv';
    console.log('🚀 ~ QnAService ~ importProducts ~ csvFilePath:', csvFilePath);
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    for await (const record of parser) {
      // Extract left side product data
      const leftProduct = {
        id: record.id_left,
        category: record.category_left,
        cluster_id: record.cluster_id_left,
        brand: record.brand_left,
        title: record.title_left,
        description: record.description_left,
        price: record.price_left,
        specTableContent: record.specTableContent_left,
      };

      const des = leftProduct.description.slice(
        0,
        Math.min(leftProduct.description.length, 3500),
      );

      const combinedText = `${leftProduct.category} ${leftProduct.title} ${des}${leftProduct.brand}`;

      const embeddingRes = await this.geminiService.generateEmbeddings(
        `${combinedText}`,
      );
      const embedding = JSON.stringify(embeddingRes);
      const res = await this.qnaRepo.insertProduct(
        leftProduct.id,
        leftProduct.category,
        leftProduct.cluster_id,
        leftProduct.brand,
        leftProduct.title,
        leftProduct.description,
        leftProduct.price,
        leftProduct.specTableContent,
        embedding,
      );
    }
    return 'Successfully imported products';
  }

  async localBestPossibleResultByQuery(
    searchDto: SearchVectorByQuestionDto,
  ): Promise<QnaListResponseDto> {
    // Get results from both methods
    // Get intent and clean up the response
    const rawIntent = await this.localAiService.returnIntent(
      searchDto.question,
    );
    const intentJson = rawIntent.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const intent = JSON.parse(intentJson);
    console.log('🚀 ~ QnAService ~ intent:', intent);
    const cosineResults = await this.searchCosineByLocalQuery(
      searchDto,
      intent,
    );
    const hybridResults = await this.searchHybridByLocalQuery(
      searchDto,
      intent,
    );

    // Combine and re-rank
    const combinedResults = new Map();

    // Process cosine results
    cosineResults.data.forEach((item) => {
      combinedResults.set(item.id, {
        ...item,
        cosine_score: item.cosine_similarity,
        hybrid_score: 0,
        combined_score: item.cosine_similarity * 0.5,
      });
    });

    // Process hybrid results
    hybridResults.data.forEach((item) => {
      if (combinedResults.has(item.id)) {
        // Update existing entry
        const existing = combinedResults.get(item.id);
        existing.hybrid_score = 1 - item.hybrid_score; // Convert to similarity
        existing.combined_score += existing.hybrid_score * 0.5;
      } else {
        // Add new entry
        combinedResults.set(item.id, {
          ...item,
          cosine_score: 0,
          hybrid_score: 1 - item.hybrid_score, // Convert to similarity
          combined_score: (1 - item.hybrid_score) * 0.5,
        });
      }
    });

    // Sort by combined score and apply base filtering
    // FIX: Using more reasonable filtering conditions - only check combined_score
    const sortedResults = Array.from(combinedResults.values())
      .filter((result) => result.combined_score > 0.4)
      .sort((a, b) => b.combined_score - a.combined_score)
      .slice(0, searchDto.limit || 5);

    // Apply category filtering if applicable
    let categoryFilteredResults = sortedResults;
    if (intent.category && intent.category !== 'Other') {
      categoryFilteredResults = sortedResults.filter(
        (result) => result.category === intent.category,
      );
    }

    // FIX: Apply price filtering in one place only
    let finalResults = categoryFilteredResults;
    if (intent.min_price || intent.max_price) {
      finalResults = categoryFilteredResults.filter((result) => {
        // Skip price filtering if price is empty or not a valid number
        if (!result.price) return true;

        const price = parseFloat(result.price);
        if (isNaN(price)) return true;

        const minPrice = intent.min_price ? parseFloat(intent.min_price) : null;

        const maxPrice = intent.max_price ? parseFloat(intent.max_price) : null;

        if (minPrice !== null && maxPrice !== null) {
          return price >= minPrice && price <= maxPrice;
        } else if (minPrice !== null) {
          return price >= minPrice;
        } else if (maxPrice !== null) {
          return price <= maxPrice;
        }
        return true;
      });
    }

    return this.apiResponse.success(finalResults);
  }

  async searchCosineByLocalQuery(
    searchDto: SearchVectorByQueryDto,
    intent: any,
  ) {
    const { businessId, limit = 5 } = searchDto;

    const embeddingRes = await this.localAiService.generateEmbeddings(
      intent.title,
    );
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchCosineByQuery(
      embedding,
      businessId,
      limit,
    );
    return this.apiResponse.success(results);
  }

  async searchHybridByLocalQuery(
    searchDto: SearchVectorByQueryDto,
    intent: any,
  ) {
    const { question, businessId, limit = 5 } = searchDto;

    const embeddingRes = await this.localAiService.generateEmbeddings(
      intent.title,
    );
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchHybridByQuery(
      embedding,
      intent.title,
      businessId,
      limit,
    );
    return this.apiResponse.success(results);
  }
}
