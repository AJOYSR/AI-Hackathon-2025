import { Injectable } from '@nestjs/common';
import { GraphExecutor } from '../../langgraph/core/graph.executor';
import { MetricsCollector } from '../../langgraph/utils/metrics.collector';
import { APIResponse } from '../../internal/api-response/api-response.service';

@Injectable()
export class SearchPipelineStatsService {
  constructor(
    private readonly graphExecutor: GraphExecutor,
    private readonly metricsCollector: MetricsCollector,
    private readonly apiResponse: APIResponse,
  ) {}

  async getPipelineStats() {
    const stats = {
      performance: {
        averageProcessingTime: this.metricsCollector.getAverageProcessingTime(),
        totalRequests: this.metricsCollector.getTotalRequests(),
        successRate: this.metricsCollector.getSuccessRate(),
        errorRate: this.metricsCollector.getErrorRate(),
      },
      nodeMetrics: this.metricsCollector.getNodeMetrics(),
      costMetrics: {
        totalTokens: this.metricsCollector.getTotalTokens(),
        averageTokensPerRequest: this.metricsCollector.getAverageTokensPerRequest(),
        estimatedCost: this.metricsCollector.getEstimatedCost(),
      },
      resourceUsage: {
        averageMemory: this.metricsCollector.getAverageMemoryUsage(),
        averageCPU: this.metricsCollector.getAverageCPUUsage(),
        peakMemory: this.metricsCollector.getPeakMemoryUsage(),
        peakCPU: this.metricsCollector.getPeakCPUUsage(),
      },
      errorAnalysis: {
        commonErrors: this.metricsCollector.getCommonErrors(),
        errorDistribution: this.metricsCollector.getErrorDistribution(),
      },
      cacheMetrics: {
        hitRate: this.metricsCollector.getCacheHitRate(),
        missRate: this.metricsCollector.getCacheMissRate(),
        totalCacheSize: this.metricsCollector.getTotalCacheSize(),
      },
      latencyMetrics: {
        p50: this.metricsCollector.getLatencyPercentile(50),
        p90: this.metricsCollector.getLatencyPercentile(90),
        p99: this.metricsCollector.getLatencyPercentile(99),
      },
      throughput: {
        requestsPerMinute: this.metricsCollector.getRequestsPerMinute(),
        averageResponseTime: this.metricsCollector.getAverageResponseTime(),
      },
      nodeHealth: this.metricsCollector.getNodeHealth(),
      systemHealth: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };

    return this.apiResponse.success(stats);
  }

  async getNodeStats(nodeName: string) {
    const nodeStats = {
      performance: this.metricsCollector.getNodePerformance(nodeName),
      errors: this.metricsCollector.getNodeErrors(nodeName),
      resourceUsage: this.metricsCollector.getNodeResourceUsage(nodeName),
      throughput: this.metricsCollector.getNodeThroughput(nodeName),
      cost: this.metricsCollector.getNodeCost(nodeName),
    };

    return this.apiResponse.success(nodeStats);
  }

  async getCostAnalysis() {
    const costAnalysis = {
      totalCost: this.metricsCollector.getTotalCost(),
      costByNode: this.metricsCollector.getCostByNode(),
      costTrend: this.metricsCollector.getCostTrend(),
      costOptimization: this.metricsCollector.getCostOptimizationSuggestions(),
    };

    return this.apiResponse.success(costAnalysis);
  }
} 