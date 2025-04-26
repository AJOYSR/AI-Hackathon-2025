import { BaseNode } from '../core/base.node';
import { NodeInput, SearchState } from '../types/base.types';
import { createClient } from 'redis';
import { Logger } from '../utils/logger';

export class QueryCacheCheckNode extends BaseNode {
  private readonly redisClient;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly logger: Logger;
  private redisConnected = false;

  constructor(config: any, context: any) {
    super(config, context);
    this.logger = context.logger;
    
    // Initialize Redis client with error handling
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redisClient.on('error', (err) => {
      this.logger.warn('Redis connection error:', err);
      this.redisConnected = false;
    });

    this.redisClient.on('connect', () => {
      this.logger.info('Redis connected successfully');
      this.redisConnected = true;
    });

    // Attempt to connect but don't block if it fails
    this.redisClient.connect().catch(err => {
      this.logger.warn('Failed to connect to Redis:', err);
      this.redisConnected = false;
    });
  }

  public async process(input: NodeInput): Promise<SearchState> {
    const { state } = input;
    const cacheKey = this.generateCacheKey(state.query);

    try {
      if (this.redisConnected) {
        const cachedResult = await this.redisClient.get(cacheKey);
        
        if (cachedResult) {
          return {
            ...state,
            cache: {
              queryHit: true,
              resultHit: true,
              cacheKey,
              timestamp: Date.now(),
            },
            searchResults: JSON.parse(cachedResult),
          };
        }
      }

      // If Redis is not connected or no cache hit, continue without cache
      return {
        ...state,
        cache: {
          queryHit: false,
          resultHit: false,
          cacheKey,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      this.logger.error('Cache check error:', error);
      // If cache fails, continue without cache
      return {
        ...state,
        cache: {
          queryHit: false,
          resultHit: false,
          cacheKey,
          timestamp: Date.now(),
        },
      };
    }
  }

  public determineNextNode(state: SearchState): string {
    return state.cache.queryHit ? 'response-formatter' : 'intent-classifier';
  }

  private generateCacheKey(query: string): string {
    // Normalize query for consistent caching
    const normalizedQuery = query.toLowerCase().trim();
    return `search:${normalizedQuery}`;
  }

  public async setCache(query: string, result: any): Promise<void> {
    if (!this.redisConnected) {
      this.logger.warn('Redis not connected, skipping cache set');
      return;
    }

    try {
      const cacheKey = this.generateCacheKey(query);
      await this.redisClient.set(cacheKey, JSON.stringify(result), {
        EX: this.CACHE_TTL,
      });
    } catch (error) {
      this.logger.error('Failed to set cache:', error);
    }
  }
} 