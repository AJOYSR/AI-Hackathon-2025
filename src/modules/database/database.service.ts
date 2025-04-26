import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get('POSTGRES_HOST'),
      port: parseInt(this.configService.get('POSTGRES_PORT')),
      user: this.configService.get('POSTGRES_USER'),
      password: this.configService.get('POSTGRES_PASSWORD'),
      database: this.configService.get('POSTGRES_DATABASE'),
      ssl: true,
    });
  }

  async onModuleInit() {
    // Test database connection
    try {
      const client = await this.pool.connect();
      client.release();
      console.log('\n<->PG:Database connection established<->\n');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }
}
