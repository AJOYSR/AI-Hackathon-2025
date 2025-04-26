import { Logger } from './logger';

export class MetricsCollector {
  private metrics: Map<string, any>;
  private nodeMetrics: Map<string, any>;
  private logger: Logger;

  constructor(logger: Logger) {
    this.metrics = new Map();
    this.nodeMetrics = new Map();
    this.logger = logger;
  }

  // Performance metrics
  getAverageProcessingTime(): number {
    return this.metrics.get('averageProcessingTime') || 0;
  }

  getTotalRequests(): number {
    return this.metrics.get('totalRequests') || 0;
  }

  getSuccessRate(): number {
    const total = this.getTotalRequests();
    const success = this.metrics.get('successfulRequests') || 0;
    return total > 0 ? success / total : 0;
  }

  getErrorRate(): number {
    return 1 - this.getSuccessRate();
  }

  // Node metrics
  getNodeMetrics(): Record<string, any> {
    return Object.fromEntries(this.nodeMetrics);
  }

  // Cost metrics
  getTotalTokens(): number {
    return this.metrics.get('totalTokens') || 0;
  }

  getAverageTokensPerRequest(): number {
    const total = this.getTotalRequests();
    return total > 0 ? this.getTotalTokens() / total : 0;
  }

  getEstimatedCost(): number {
    const tokens = this.getTotalTokens();
    // Assuming $0.0004 per 1K tokens (adjust based on your model)
    return (tokens / 1000) * 0.0004;
  }

  // Resource usage
  getAverageMemoryUsage(): number {
    return this.metrics.get('averageMemoryUsage') || 0;
  }

  getAverageCPUUsage(): number {
    return this.metrics.get('averageCPUUsage') || 0;
  }

  getPeakMemoryUsage(): number {
    return this.metrics.get('peakMemoryUsage') || 0;
  }

  getPeakCPUUsage(): number {
    return this.metrics.get('peakCPUUsage') || 0;
  }

  // Error analysis
  getCommonErrors(): Record<string, number> {
    return this.metrics.get('commonErrors') || {};
  }

  getErrorDistribution(): Record<string, number> {
    return this.metrics.get('errorDistribution') || {};
  }

  // Cache metrics
  getCacheHitRate(): number {
    const hits = this.metrics.get('cacheHits') || 0;
    const misses = this.metrics.get('cacheMisses') || 0;
    const total = hits + misses;
    return total > 0 ? hits / total : 0;
  }

  getCacheMissRate(): number {
    return 1 - this.getCacheHitRate();
  }

  getTotalCacheSize(): number {
    return this.metrics.get('totalCacheSize') || 0;
  }

  // Latency metrics
  getLatencyPercentile(percentile: number): number {
    const latencies = this.metrics.get('latencies') || [];
    if (latencies.length === 0) return 0;
    
    latencies.sort((a: number, b: number) => a - b);
    const index = Math.ceil((percentile / 100) * latencies.length) - 1;
    return latencies[index];
  }

  // Throughput
  getRequestsPerMinute(): number {
    return this.metrics.get('requestsPerMinute') || 0;
  }

  getAverageResponseTime(): number {
    return this.metrics.get('averageResponseTime') || 0;
  }

  // Node health
  getNodeHealth(): Record<string, any> {
    return this.metrics.get('nodeHealth') || {};
  }

  // Node-specific metrics
  getNodePerformance(nodeName: string): Record<string, any> {
    return this.nodeMetrics.get(nodeName)?.performance || {};
  }

  getNodeErrors(nodeName: string): Record<string, any> {
    return this.nodeMetrics.get(nodeName)?.errors || {};
  }

  getNodeResourceUsage(nodeName: string): Record<string, any> {
    return this.nodeMetrics.get(nodeName)?.resourceUsage || {};
  }

  getNodeThroughput(nodeName: string): Record<string, any> {
    return this.nodeMetrics.get(nodeName)?.throughput || {};
  }

  getNodeCost(nodeName: string): number {
    return this.nodeMetrics.get(nodeName)?.cost || 0;
  }

  // Cost analysis
  getTotalCost(): number {
    return this.metrics.get('totalCost') || 0;
  }

  getCostByNode(): Record<string, number> {
    return this.metrics.get('costByNode') || {};
  }

  getCostTrend(): Record<string, number> {
    return this.metrics.get('costTrend') || {};
  }

  getCostOptimizationSuggestions(): string[] {
    return this.metrics.get('costOptimizationSuggestions') || [];
  }

  // Update methods
  updateMetrics(metrics: Record<string, any>): void {
    Object.entries(metrics).forEach(([key, value]) => {
      this.metrics.set(key, value);
    });
  }

  updateNodeMetrics(nodeName: string, metrics: Record<string, any>): void {
    this.nodeMetrics.set(nodeName, metrics);
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics.clear();
    this.nodeMetrics.clear();
  }
} 