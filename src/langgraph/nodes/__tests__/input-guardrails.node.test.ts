import { InputGuardrailsNode } from '../input-guardrails.node';
import { NodeConfig, NodeContext, SearchState, NodeInput } from '../../types/base.types';
import { Logger } from '../../utils/logger';
import { MetricsCollector } from '../../utils/metrics.collector';

describe('InputGuardrailsNode', () => {
  let node: InputGuardrailsNode;
  let config: NodeConfig;
  let context: NodeContext;

  beforeEach(() => {
    config = {
      name: 'test-node',
      description: 'Test node',
      priority: 1,
      timeoutMs: 5000,
      retryAttempts: 3
    };

    const logger = new Logger('input-guardrails-test');
    context = {
      config,
      logger,
      metrics: new MetricsCollector(logger)
    };

    node = new InputGuardrailsNode(config, context);
  });

  it('should validate input with valid query', async () => {
    const input: NodeInput = {
      state: {
        query: 'valid query',
        intent: {
          type: 'search',
          confidence: 1,
          parameters: {}
        },
        enhancedQuery: '',
        searchResults: [],
        rankedResults: [],
        finalResponse: '',
        cache: {
          queryHit: false,
          resultHit: false,
          cacheKey: '',
          timestamp: Date.now()
        },
        guardrails: {
          inputValidation: {
            passed: true,
            checks: {
              length: true,
              charset: true,
              rateLimit: true,
              ipCheck: true,
              syntax: true
            }
          },
          queryValidation: {
            passed: true,
            checks: {
              semantic: true,
              intent: true,
              complexity: true,
              resources: true,
              context: true
            }
          },
          outputValidation: {
            passed: true,
            checks: {
              content: true,
              privacy: true,
              format: true,
              relevance: true,
              diversity: true
            }
          }
        },
        metadata: {
          timestamp: Date.now(),
          processingTime: 0,
          resourceUsage: {
            memory: 0,
            cpu: 0,
            network: 0
          }
        }
      },
      context
    };

    const result = await node.process(input);
    expect(result.guardrails.inputValidation.passed).toBe(true);
    expect(node.determineNextNode(result)).toBe('query-cache-check');
  });

  it('should reject input with empty query', async () => {
    const input: NodeInput = {
      state: {
        query: '',
        intent: {
          type: 'search',
          confidence: 1,
          parameters: {}
        },
        enhancedQuery: '',
        searchResults: [],
        rankedResults: [],
        finalResponse: '',
        cache: {
          queryHit: false,
          resultHit: false,
          cacheKey: '',
          timestamp: Date.now()
        },
        guardrails: {
          inputValidation: {
            passed: true,
            checks: {
              length: true,
              charset: true,
              rateLimit: true,
              ipCheck: true,
              syntax: true
            }
          },
          queryValidation: {
            passed: true,
            checks: {
              semantic: true,
              intent: true,
              complexity: true,
              resources: true,
              context: true
            }
          },
          outputValidation: {
            passed: true,
            checks: {
              content: true,
              privacy: true,
              format: true,
              relevance: true,
              diversity: true
            }
          }
        },
        metadata: {
          timestamp: Date.now(),
          processingTime: 0,
          resourceUsage: {
            memory: 0,
            cpu: 0,
            network: 0
          }
        }
      },
      context
    };

    const result = await node.process(input);
    expect(result.guardrails.inputValidation.passed).toBe(false);
    expect(result.guardrails.inputValidation.checks.length).toBe(false);
    expect(node.determineNextNode(result)).toBe('error-handler');
  });

  it('should reject input with query too long', async () => {
    const input: NodeInput = {
      state: {
        query: 'a'.repeat(1001),
        intent: {
          type: 'search',
          confidence: 1,
          parameters: {}
        },
        enhancedQuery: '',
        searchResults: [],
        rankedResults: [],
        finalResponse: '',
        cache: {
          queryHit: false,
          resultHit: false,
          cacheKey: '',
          timestamp: Date.now()
        },
        guardrails: {
          inputValidation: {
            passed: true,
            checks: {
              length: true,
              charset: true,
              rateLimit: true,
              ipCheck: true,
              syntax: true
            }
          },
          queryValidation: {
            passed: true,
            checks: {
              semantic: true,
              intent: true,
              complexity: true,
              resources: true,
              context: true
            }
          },
          outputValidation: {
            passed: true,
            checks: {
              content: true,
              privacy: true,
              format: true,
              relevance: true,
              diversity: true
            }
          }
        },
        metadata: {
          timestamp: Date.now(),
          processingTime: 0,
          resourceUsage: {
            memory: 0,
            cpu: 0,
            network: 0
          }
        }
      },
      context
    };

    const result = await node.process(input);
    expect(result.guardrails.inputValidation.passed).toBe(false);
    expect(result.guardrails.inputValidation.checks.length).toBe(false);
    expect(node.determineNextNode(result)).toBe('error-handler');
  });
}); 