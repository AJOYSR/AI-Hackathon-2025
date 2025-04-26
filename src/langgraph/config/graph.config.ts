import { InputGuardrailsNode } from '../nodes/input-guardrails.node';
import { QueryCacheCheckNode } from '../nodes/query-cache-check.node';
import { IntentClassifierNode } from '../nodes/intent-classifier.node';
import { SearchExecutorNode } from '../nodes/search-executor.node';
import { ResultRankerNode } from '../nodes/result-ranker.node';
import { ResponseFormatterNode } from '../nodes/response-formatter.node';
import { ErrorHandlerNode } from '../nodes/error-handler.node';
import { NodeConfig, NodeContext } from '../types/base.types';
import * as winston from 'winston';
import { MetricsCollector } from '../core/metrics.collector';

export const createGraphConfig = () => {
  // Create shared context for all nodes
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/graph.log' }),
    ],
  });
  const metrics = new MetricsCollector(logger);

  const createNodeContext = (config: NodeConfig): NodeContext => ({
    config,
    logger,
    metrics,
  });

  // Create node instances with their configurations
  const nodes = {
    'input-guardrails': new InputGuardrailsNode(
      {
        name: 'input-guardrails',
        description: 'Validates and sanitizes input queries',
        priority: 1,
        retryAttempts: 3,
      },
      createNodeContext({
        name: 'input-guardrails',
        description: 'Validates and sanitizes input queries',
        priority: 1,
        retryAttempts: 3,
      }),
    ),
    'query-cache-check': new QueryCacheCheckNode(
      {
        name: 'query-cache-check',
        description: 'Checks if the query results are cached',
        priority: 2,
        retryAttempts: 3,
      },
      createNodeContext({
        name: 'query-cache-check',
        description: 'Checks if the query results are cached',
        priority: 2,
        retryAttempts: 3,
      }),
    ),
    'intent-classifier': new IntentClassifierNode(
      {
        name: 'intent-classifier',
        description: 'Classifies the user intent from the query',
        priority: 3,
        retryAttempts: 3,
      },
      createNodeContext({
        name: 'intent-classifier',
        description: 'Classifies the user intent from the query',
        priority: 3,
        retryAttempts: 3,
      }),
    ),
    'search-executor': new SearchExecutorNode(
      {
        name: 'search-executor',
        description: 'Executes the search based on classified intent',
        priority: 4,
        retryAttempts: 3,
      },
      createNodeContext({
        name: 'search-executor',
        description: 'Executes the search based on classified intent',
        priority: 4,
        retryAttempts: 3,
      }),
    ),
    'result-ranker': new ResultRankerNode(
      {
        name: 'result-ranker',
        description: 'Ranks search results by relevance',
        priority: 5,
        retryAttempts: 3,
      },
      createNodeContext({
        name: 'result-ranker',
        description: 'Ranks search results by relevance',
        priority: 5,
        retryAttempts: 3,
      }),
    ),
    'response-formatter': new ResponseFormatterNode(
      {
        name: 'response-formatter',
        description: 'Formats the final response',
        priority: 6,
        retryAttempts: 3,
      },
      createNodeContext({
        name: 'response-formatter',
        description: 'Formats the final response',
        priority: 6,
        retryAttempts: 3,
      }),
    ),
    'error-handler': new ErrorHandlerNode(
      {
        name: 'error-handler',
        description: 'Handles errors from any node',
        priority: 0,
        retryAttempts: 3,
      },
      createNodeContext({
        name: 'error-handler',
        description: 'Handles errors from any node',
        priority: 0,
        retryAttempts: 3,
      }),
    ),
  };

  // Define the edges between nodes
  const edges = [
    { from: 'input-guardrails', to: 'query-cache-check' },
    { from: 'query-cache-check', to: 'intent-classifier' },
    { from: 'intent-classifier', to: 'search-executor' },
    { from: 'search-executor', to: 'result-ranker' },
    { from: 'result-ranker', to: 'response-formatter' },
    { from: 'error-handler', to: 'response-formatter' },
  ];

  // Define entry and exit points
  const entryPoint = 'input-guardrails';
  const exitPoint = 'response-formatter';

  return {
    nodes,
    edges,
    entryPoint,
    exitPoint,
  };
}; 