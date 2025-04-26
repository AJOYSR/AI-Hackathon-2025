import { Injectable } from '@nestjs/common';
import { SearchState } from '../types/base.types';
import { createGraphConfig } from '../config/graph.config';
import { Logger } from '../utils/logger';
import { MetricsCollector } from './metrics.collector';
import * as winston from 'winston';

@Injectable()
export class GraphExecutor {
  private readonly config;
  private readonly logger: winston.Logger;
  private readonly metrics: MetricsCollector;

  constructor() {
    this.config = createGraphConfig();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/graph-executor.log' }),
      ],
    });
    this.metrics = new MetricsCollector(this.logger);
  }

  async execute(query: string, metadata: any): Promise<SearchState> {
    try {
      // Initialize the state
      let state: SearchState = {
        query,
        enhancedQuery: query,
        metadata: {
          ...metadata,
          processingTime: 0,
          resourceUsage: {
            memory: 0,
            cpu: 0,
          },
        },
        guardrails: {
          inputValidation: {
            passed: false,
            checks: {
              length: false,
              charset: false,
              rateLimit: false,
              ipCheck: false,
              syntax: false,
            },
          },
          queryValidation: {
            passed: false,
            checks: {
              semantic: false,
              intent: false,
              complexity: false,
              resources: false,
              context: false,
            },
          },
          outputValidation: {
            passed: false,
            checks: {
              content: false,
              privacy: false,
              format: false,
              relevance: false,
              diversity: false,
            },
          },
        },
        cache: {
          queryHit: false,
          resultHit: false,
          cacheKey: '',
          timestamp: 0,
        },
        intent: {
          type: 'unknown',
          confidence: 0,
          parameters: {},
        },
        searchResults: [],
        rankedResults: [],
        finalResponse: '',
      };

      // Start from the entry point
      let currentNode = this.config.entryPoint;
      const startTime = Date.now();

      while (currentNode && currentNode !== this.config.exitPoint) {
        const node = this.config.nodes[currentNode];
        if (!node) {
          throw new Error(`Node ${currentNode} not found`);
        }

        // Process the current node
        state = await node.process({ state });
        
        // Determine the next node
        currentNode = node.determineNextNode(state);
      }

      // Calculate processing time
      state.metadata.processingTime = Date.now() - startTime;

      return state;
    } catch (error) {
      this.logger.error('Graph execution failed:', error);
      throw error;
    }
  }

  public getNodeMetrics(): Record<string, any> {
    return this.metrics.getNodeMetrics();
  }

  public getGraphMetrics(): Record<string, any> {
    return this.metrics.getGraphMetrics();
  }
} 