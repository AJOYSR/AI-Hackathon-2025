import { Logger } from 'winston';

export class MetricsCollector {
  private readonly logger: Logger;
  private readonly nodeMetrics: Map<string, {
    executionCount: number;
    successCount: number;
    failureCount: number;
    totalDuration: number;
    averageDuration: number;
    lastExecutionTime: number;
  }>;
  private readonly graphMetrics: {
    executionCount: number;
    successCount: number;
    failureCount: number;
    totalDuration: number;
    averageDuration: number;
    lastExecutionTime: number;
  };

  constructor(logger: Logger) {
    this.logger = logger;
    this.nodeMetrics = new Map();
    this.graphMetrics = {
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      lastExecutionTime: 0,
    };
  }

  public recordNodeExecution(nodeName: string, duration: number, success: boolean): void {
    const metrics = this.nodeMetrics.get(nodeName) || {
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      totalDuration: 0,
      averageDuration: 0,
      lastExecutionTime: 0,
    };

    metrics.executionCount++;
    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.executionCount;
    metrics.lastExecutionTime = Date.now();

    this.nodeMetrics.set(nodeName, metrics);
    this.logger.debug(`Node metrics updated for ${nodeName}:`, metrics);
  }

  public recordGraphExecution(duration: number, success: boolean): void {
    this.graphMetrics.executionCount++;
    if (success) {
      this.graphMetrics.successCount++;
    } else {
      this.graphMetrics.failureCount++;
    }
    this.graphMetrics.totalDuration += duration;
    this.graphMetrics.averageDuration = this.graphMetrics.totalDuration / this.graphMetrics.executionCount;
    this.graphMetrics.lastExecutionTime = Date.now();

    this.logger.debug('Graph metrics updated:', this.graphMetrics);
  }

  public getNodeMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    this.nodeMetrics.forEach((value, key) => {
      metrics[key] = { ...value };
    });
    return metrics;
  }

  public getGraphMetrics(): Record<string, any> {
    return { ...this.graphMetrics };
  }

  public resetMetrics(): void {
    this.nodeMetrics.clear();
    this.graphMetrics.executionCount = 0;
    this.graphMetrics.successCount = 0;
    this.graphMetrics.failureCount = 0;
    this.graphMetrics.totalDuration = 0;
    this.graphMetrics.averageDuration = 0;
    this.graphMetrics.lastExecutionTime = 0;
    this.logger.info('All metrics have been reset');
  }
} 