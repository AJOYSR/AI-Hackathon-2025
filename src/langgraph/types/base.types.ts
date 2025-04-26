import { BaseMessage, HumanMessage } from '@langchain/core/messages';

export interface SearchState {
  query: string;
  enhancedQuery?: string;
  intent: {
    type: string;
    confidence: number;
    parameters: Record<string, any>;
  };
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
  priority: number;
  retryAttempts: number;
  fallbackStrategy?: {
    type: 'retry' | 'skip' | 'fail';
    maxRetries?: number;
    backoffMs?: number;
  };
  validation?: {
    input?: {
      required?: string[];
      optional?: string[];
    };
    output?: {
      required?: string[];
      optional?: string[];
    };
  };
  timeoutMs?: number;
  maxConcurrency?: number;
  rateLimit?: {
    requestsPerSecond?: number;
    burstSize?: number;
  };
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeoutMs?: number;
  };
  metrics?: {
    enabled?: boolean;
    labels?: Record<string, string>;
  };
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    format?: 'json' | 'text';
  };
  cache?: {
    enabled?: boolean;
    ttlMs?: number;
    strategy?: 'memory' | 'redis';
  };
  security?: {
    authentication?: boolean;
    authorization?: boolean;
    rateLimit?: boolean;
    standards?: string[];
    level?: string;
  };
  monitoring?: {
    enabled?: boolean;
    alerts?: {
      errorRate?: number;
      latencyMs?: number;
    };
  };
  tracing?: {
    enabled?: boolean;
    samplingRate?: number;
  };
  errorHandling?: {
    retryOn?: string[];
    skipOn?: string[];
    failOn?: string[];
  };
  performance?: {
    maxMemoryMb?: number;
    maxCpuPercent?: number;
    benchmarks?: Record<string, number>;
    targets?: Record<string, number>;
  };
  scaling?: {
    minInstances?: number;
    maxInstances?: number;
    targetUtilization?: number;
  };
  dependencies?: {
    required?: string[];
    optional?: string[];
  };
  environment?: Record<string, string>;
  secrets?: string[];
  tags?: string[];
  annotations?: Record<string, string>;
  version?: string;
  deprecated?: boolean;
  experimental?: boolean;
  documentation?: {
    description?: string;
    api?: boolean;
    user?: boolean;
    developer?: boolean;
  };
  examples?: string[];
  tests?: {
    unit?: string[];
    integration?: string[];
  };
  maintenance?: {
    schedule?: string;
    duration?: string;
  };
  backup?: {
    enabled?: boolean;
    frequency?: string;
    retention?: string;
  };
  compliance?: {
    standards?: string[];
    requirements?: string[];
  };
  cost?: {
    budget?: number;
    alertThreshold?: number;
  };
  sla?: {
    availability?: number;
    latency?: number;
    throughput?: number;
  };
  disasterRecovery?: {
    strategy?: string;
    rto?: string;
    rpo?: string;
  };
  observability?: {
    metrics?: boolean;
    logs?: boolean;
    traces?: boolean;
  };
  deployment?: {
    strategy?: string;
    rollback?: boolean;
    canary?: boolean;
  };
  testing?: {
    coverage?: number;
    types?: string[];
  };
  support?: {
    level?: string;
    responseTime?: string;
  };
  lifecycle?: {
    stage?: string;
    endOfLife?: string;
  };
  integration?: {
    protocols?: string[];
    formats?: string[];
  };
  localization?: {
    languages?: string[];
    default?: string;
  };
  accessibility?: {
    standards?: string[];
    level?: string;
  };
  privacy?: {
    dataTypes?: string[];
    retention?: string;
  };
  reliability?: {
    redundancy?: number;
    failover?: boolean;
    maturity?: number;
    faultTolerance?: number;
  };
  maintainability?: {
    complexity?: number;
    documentation?: number;
    analyzability?: number;
    changeability?: number;
  };
  portability?: {
    platforms?: string[];
    dependencies?: string[];
    adaptability?: number;
    installability?: number;
  };
  usability?: {
    learnability?: number;
    efficiency?: number;
    understandability?: number;
    operability?: number;
  };
  testability?: {
    coverage?: number;
    automation?: number;
  };
  reusability?: {
    modularity?: number;
    generality?: number;
  };
  interoperability?: {
    standards?: string[];
    protocols?: string[];
  };
  efficiency?: {
    resourceUsage?: Record<string, number>;
    optimization?: string[];
  };
  functionality?: {
    completeness?: number;
    correctness?: number;
  };
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