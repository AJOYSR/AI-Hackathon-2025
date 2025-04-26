import { GraphConfig, GraphNode, NodeInput, NodeOutput, SearchState, NodeContext } from '../types/base.types';
import { Logger } from '../utils/logger';
import { MetricsCollector } from './metrics.collector';
import * as winston from 'winston';

export class GraphExecutor {
  private readonly config: GraphConfig;
  private readonly logger: winston.Logger;
  private readonly metrics: MetricsCollector;
  private readonly nodeMap: Map<string, GraphNode>;

  constructor(config: GraphConfig, logger: winston.Logger) {
    this.config = config;
    this.logger = logger;
    this.metrics = new MetricsCollector(logger);
    this.nodeMap = new Map(config.nodes.map(node => [node.name, node]));
  }

  public async execute(query: string, context: { requestId: string; timestamp: string }): Promise<SearchState> {
    try {
      this.logger.info('Starting graph execution', { service: 'graph-executor' });

      // Initialize the state
      const initialState: SearchState = {
        query,
        enhancedQuery: query,
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

      // Create node context
      const nodeContext: NodeContext = {
        config: {
          name: 'graph-executor',
          description: 'Main graph executor',
          timeout: 30000,
          retryAttempts: 3,
          fallbackStrategy: 'error-handler',
        },
        logger: this.logger,
        metrics: this.metrics,
      };

      // Execute the graph
      let currentState = initialState;
      let currentNode = this.config.entryPoint;

      while (currentNode !== 'end') {
        const node = this.nodeMap.get(currentNode);
        if (!node) {
          throw new Error(`Node ${currentNode} not found in graph configuration`);
        }

        try {
          const input: NodeInput = { state: currentState, context: nodeContext };
          const result = await this.executeNodeWithRetry(node, input);
          currentState = result.state;
          currentNode = result.next;

          // Record metrics
          const nodeDuration = Date.now() - currentState.metadata.timestamp;
          this.metrics.recordNodeExecution(node.name, nodeDuration, !currentState.metadata.error);
          this.logger.debug(`Node ${node.name} completed`, {
            duration: nodeDuration,
            nextNode: currentNode,
            success: !currentState.metadata.error,
          });
        } catch (error) {
          this.logger.error('Error executing node', {
            node: currentNode,
            error,
            state: currentState,
          });
          currentState.metadata.error = error as Error;
          currentNode = node.config.fallbackStrategy || 'error-handler';
        }
      }

      // Record overall execution metrics
      const totalDuration = Date.now() - initialState.metadata.timestamp;
      this.metrics.recordGraphExecution(totalDuration, !currentState.metadata.error);
      this.logger.info('Graph execution completed', {
        duration: totalDuration,
        success: !currentState.metadata.error,
      });

      return currentState;
    } catch (error) {
      this.logger.error('Error in graph execution', { error });
      throw error;
    }
  }

  private async executeNodeWithRetry(node: GraphNode, input: NodeInput): Promise<NodeOutput> {
    let attempts = 0;
    const maxAttempts = node.config.retryAttempts || 3;

    while (attempts < maxAttempts) {
      try {
        return await node.execute(input);
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          throw error;
        }
        this.logger.warn(`Retrying node ${node.name}, attempt ${attempts}`, { error });
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
      }
    }

    throw new Error(`Failed to execute node ${node.name} after ${maxAttempts} attempts`);
  }

  public getNodeMetrics(): Record<string, any> {
    return this.metrics.getNodeMetrics();
  }

  public getGraphMetrics(): Record<string, any> {
    return this.metrics.getGraphMetrics();
  }
} 