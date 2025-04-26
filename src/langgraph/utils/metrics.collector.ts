import { Logger } from './logger';

export class MetricsCollector {
  private metrics: Map<string, number>;
  private readonly service: string;
  private readonly logger: Logger;

  constructor(logger: Logger, service: string) {
    this.metrics = new Map();
    this.service = service;
    this.logger = logger;
  }

  increment(metric: string, value: number = 1): void {
    const currentValue = this.metrics.get(metric) || 0;
    this.metrics.set(metric, currentValue + value);
    this.logger.debug(`Incremented metric ${metric} by ${value}`, { service: this.service });
  }

  gauge(metric: string, value: number): void {
    this.metrics.set(metric, value);
    this.logger.debug(`Set gauge ${metric} to ${value}`, { service: this.service });
  }

  timing(metric: string, value: number): void {
    this.metrics.set(metric, value);
    this.logger.debug(`Set timing ${metric} to ${value}ms`, { service: this.service });
  }

  getMetric(metric: string): number {
    return this.metrics.get(metric) || 0;
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
    this.logger.debug('Reset all metrics', { service: this.service });
  }
} 