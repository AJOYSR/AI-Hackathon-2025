import { BaseMessage, HumanMessage } from '@langchain/core/messages';

export interface SearchState {
  query: string;
  intent: {
    type: string;
    confidence: number;
    parameters: Record<string, any>;
  };
  enhancedQuery: string;
  searchResults: Array<SearchResult>;
  rankedResults: Array<RankedResult>;
  finalResponse: string;
  cache: {
    queryHit: boolean;
    resultHit: boolean;
    cacheKey: string;
    timestamp: number;
  };
  guardrails: {
    inputValidation: {
      passed: boolean;
      checks: {
        length: boolean;
        charset: boolean;
        rateLimit: boolean;
        ipCheck: boolean;
        syntax: boolean;
      };
    };
    queryValidation: {
      passed: boolean;
      checks: {
        semantic: boolean;
        intent: boolean;
        complexity: boolean;
        resources: boolean;
        context: boolean;
      };
    };
    outputValidation: {
      passed: boolean;
      checks: {
        content: boolean;
        privacy: boolean;
        format: boolean;
        relevance: boolean;
        diversity: boolean;
      };
    };
  };
  metadata: {
    timestamp: number;
    processingTime: number;
    error?: Error;
    recoveryAttempted?: boolean;
    resourceUsage: {
      memory: number;
      cpu: number;
      network: number;
    };
  };
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, any>;
}

export interface RankedResult extends SearchResult {
  relevance: number;
  diversity: number;
  userPreference: number;
  relevance_score: number;
  quality_score: number;
  diversity_score: number;
  ranking_explanation: string;
}

export interface NodeConfig {
  name: string;
  description: string;
  timeout?: number;
  retryAttempts?: number;
  fallbackStrategy?: string;
}

export interface NodeContext {
  config: NodeConfig;
  logger: any; // TODO: Replace with actual logger type
  metrics: any; // TODO: Replace with actual metrics type
}

export interface NodeInput {
  state: SearchState;
  context: NodeContext;
}

export interface NodeOutput {
  state: SearchState;
  next: string;
}

export type NodeFunction = (input: NodeInput) => Promise<NodeOutput>;

export interface GraphNode {
  name: string;
  description: string;
  config: NodeConfig;
  execute: NodeFunction;
}

export interface GraphEdge {
  source: string;
  target: string;
  condition?: (state: SearchState) => boolean;
}

export interface GraphConfig {
  nodes: GraphNode[];
  edges: GraphEdge[];
  entryPoint: string;
  exitPoint: string;
} 