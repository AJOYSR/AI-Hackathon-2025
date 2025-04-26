import { GraphConfig, NodeConfig } from './types/base.types';
import { InputGuardrailsNode } from './nodes/input-guardrails.node';
import { QueryCacheCheckNode } from './nodes/query-cache-check.node';
import { IntentClassifierNode } from './nodes/intent-classifier.node';
import { SearchExecutorNode } from './nodes/search-executor.node';
import { ResultRankerNode } from './nodes/result-ranker.node';
import { ResponseFormatterNode } from './nodes/response-formatter.node';
import { ErrorHandlerNode } from './nodes/error-handler.node';

export const createGraphConfig = (context: any): GraphConfig => {
  // Create node instances with proper config
  const inputGuardrailsNode = new InputGuardrailsNode({
    name: 'input-guardrails',
    description: 'Input validation and sanitization',
    priority: 1,
    retryAttempts: 2,
    fallbackStrategy: {
      type: 'fail',
      maxRetries: 2,
      backoffMs: 1000
    }
  }, context);

  const queryCacheCheckNode = new QueryCacheCheckNode({
    name: 'query-cache-check',
    description: 'Checks for cached results',
    priority: 2,
    retryAttempts: 1,
    fallbackStrategy: {
      type: 'skip',
      maxRetries: 1,
      backoffMs: 500
    }
  }, context);

  const intentClassifierNode = new IntentClassifierNode({
    name: 'intent-classifier',
    description: 'Intent classification and parameter extraction',
    priority: 3,
    retryAttempts: 2,
    fallbackStrategy: {
      type: 'fail',
      maxRetries: 2,
      backoffMs: 1000
    }
  }, context);

  const searchExecutorNode = new SearchExecutorNode({
    name: 'search-executor',
    description: 'Search execution and result retrieval',
    priority: 4,
    retryAttempts: 2,
    fallbackStrategy: {
      type: 'fail',
      maxRetries: 2,
      backoffMs: 1000
    }
  }, context);

  const resultRankerNode = new ResultRankerNode({
    name: 'result-ranker',
    description: 'Result ranking and filtering',
    priority: 5,
    retryAttempts: 2,
    fallbackStrategy: {
      type: 'fail',
      maxRetries: 2,
      backoffMs: 1000
    }
  }, context);

  const responseFormatterNode = new ResponseFormatterNode({
    name: 'response-formatter',
    description: 'Response formatting and presentation',
    priority: 6,
    retryAttempts: 1,
    fallbackStrategy: {
      type: 'fail',
      maxRetries: 1,
      backoffMs: 500
    }
  }, context);

  const errorHandlerNode = new ErrorHandlerNode({
    name: 'error-handler',
    description: 'Error handling and recovery',
    priority: 7,
    retryAttempts: 1,
    fallbackStrategy: {
      type: 'fail',
      maxRetries: 1,
      backoffMs: 500
    }
  }, context);

  // Define the graph configuration
  return {
    nodes: [
      {
        name: 'input-guardrails',
        description: 'Validates and sanitizes user input',
        config: inputGuardrailsNode.config,
        execute: (input) => inputGuardrailsNode.execute(input),
      },
      {
        name: 'query-cache-check',
        description: 'Checks for cached results',
        config: queryCacheCheckNode.config,
        execute: (input) => queryCacheCheckNode.execute(input),
      },
      {
        name: 'intent-classifier',
        description: 'Classifies user intent and extracts parameters',
        config: intentClassifierNode.config,
        execute: (input) => intentClassifierNode.execute(input),
      },
      {
        name: 'search-executor',
        description: 'Executes the search based on intent and parameters',
        config: searchExecutorNode.config,
        execute: (input) => searchExecutorNode.execute(input),
      },
      {
        name: 'result-ranker',
        description: 'Ranks and filters search results',
        config: resultRankerNode.config,
        execute: (input) => resultRankerNode.execute(input),
      },
      {
        name: 'response-formatter',
        description: 'Formats the final response',
        config: responseFormatterNode.config,
        execute: (input) => responseFormatterNode.execute(input),
      },
      {
        name: 'error-handler',
        description: 'Handles errors from any node',
        config: errorHandlerNode.config,
        execute: (input) => errorHandlerNode.execute(input),
      },
    ],
    edges: [
      // Input guardrails flow
      { source: 'input-guardrails', target: 'query-cache-check' },
      { source: 'input-guardrails', target: 'error-handler' },
      
      // Cache check flow
      { source: 'query-cache-check', target: 'intent-classifier' },
      { source: 'query-cache-check', target: 'response-formatter' },
      
      // Intent classification flow
      { source: 'intent-classifier', target: 'search-executor' },
      { source: 'intent-classifier', target: 'error-handler' },
      
      // Search execution flow
      { source: 'search-executor', target: 'result-ranker' },
      { source: 'search-executor', target: 'error-handler' },
      
      // Result ranking flow
      { source: 'result-ranker', target: 'response-formatter' },
      { source: 'result-ranker', target: 'error-handler' },
      
      // Response formatting flow
      { source: 'response-formatter', target: 'end' },
      { source: 'response-formatter', target: 'error-handler' },
      
      // Error handling flow
      { source: 'error-handler', target: 'response-formatter' },
      { source: 'error-handler', target: 'end' },
    ],
    entryPoint: 'input-guardrails',
    exitPoint: 'end',
  };
}; 