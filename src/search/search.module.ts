import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { GraphExecutor } from '../langgraph/core/graph.executor';
import { createLogger } from '../langgraph/utils/logger';
import { createGraphConfig } from '../langgraph/graph.config';

@Module({
  controllers: [SearchController],
  providers: [
    {
      provide: GraphExecutor,
      useFactory: () => {
        const logger = createLogger('graph-executor');
        const config = createGraphConfig({
          logger,
          metrics: null, // Metrics will be initialized by the executor
        });
        return new GraphExecutor(config, logger);
      },
    },
  ],
})
export class SearchModule {} 