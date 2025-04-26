import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GraphExecutor } from '../langgraph/core/graph.executor';
import { createLogger } from '../langgraph/utils/logger';
import { SearchState } from '../langgraph/types/base.types';
import * as winston from 'winston';
import { SearchRequestDto, SearchResponseDto } from './dto/search.dto';

@ApiTags('Search')
@Controller('api/search')
export class SearchController {
  private readonly logger: winston.Logger;

  constructor(private readonly graphExecutor: GraphExecutor) {
    this.logger = createLogger('search-controller');
  }

  @ApiOperation({
    summary: 'Execute a search query',
    description: 'Process a search query through the AI pipeline, including intent classification, search execution, and result ranking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search completed successfully',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input query',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during search processing',
  })
  @Post()
  async search(@Body() body: SearchRequestDto): Promise<SearchResponseDto> {
    try {
      // Validate input
      if (!body.query || typeof body.query !== 'string') {
        throw new Error('Invalid query: Query must be a non-empty string');
      }

      // Initialize state with query
      const initialState: SearchState = {
        query: body.query,
        enhancedQuery: body.query,
        intent: {
          type: 'unknown',
          confidence: 0,
          parameters: {},
        },
        searchResults: [],
        rankedResults: [],
        finalResponse: '',
        cache: {
          queryHit: false,
          resultHit: false,
          cacheKey: '',
          timestamp: Date.now(),
        },
        guardrails: {
          inputValidation: {
            passed: false,
            checks: {
              length: false,
              charset: false,
              rateLimit: true,
              ipCheck: true,
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
        metadata: {
          timestamp: Date.now(),
          processingTime: 0,
          resourceUsage: {
            memory: 0,
            cpu: 0,
            network: 0,
          },
          error: null,
          recoveryAttempted: false,
        },
      };

      this.logger.info('Starting graph execution');
      const result = await this.graphExecutor.execute(body.query, {
        requestId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      this.logger.error('Error in search pipeline', { error });
      if (error.message.includes('Invalid query')) {
        throw new HttpException({
          message: error.message,
          error: 'Bad Request',
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        message: 'Internal server error during search processing',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: 'Get search metrics',
    description: 'Retrieve performance metrics for the search pipeline, including node-level and graph-level statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            nodes: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  executions: { type: 'number', example: 100 },
                  successRate: { type: 'number', example: 0.98 },
                  averageDuration: { type: 'number', example: 150 },
                },
              },
            },
            graph: {
              type: 'object',
              properties: {
                totalExecutions: { type: 'number', example: 1000 },
                averageDuration: { type: 'number', example: 500 },
                successRate: { type: 'number', example: 0.95 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve metrics',
  })
  @Post('metrics')
  async getMetrics(): Promise<any> {
    try {
      const nodeMetrics = this.graphExecutor.getNodeMetrics();
      const graphMetrics = this.graphExecutor.getGraphMetrics();

      return {
        success: true,
        data: {
          nodes: nodeMetrics,
          graph: graphMetrics,
        },
      };
    } catch (error) {
      this.logger.error('Failed to retrieve metrics', { error });
      throw new HttpException(
        {
          message: 'Failed to retrieve metrics',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 