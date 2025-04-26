import { Module } from '@nestjs/common';
import { SearchPipelineController } from './search-pipeline.controller';
import { SearchPipelineService } from './search-pipeline.service';
import { SearchPipelineStatsService } from './search-pipeline.stats.service';
import { SearchPipelineStatsController } from './search-pipeline.stats.controller';
import { QnAModule } from '../qna/qna.module';
import { GraphExecutor } from '../../langgraph/core/graph.executor';
import { MetricsCollector } from '../../langgraph/utils/metrics.collector';
import { APIResponse } from '../../internal/api-response/api-response.service';

@Module({
  imports: [QnAModule],
  controllers: [SearchPipelineController, SearchPipelineStatsController],
  providers: [
    SearchPipelineService,
    SearchPipelineStatsService,
    GraphExecutor,
    MetricsCollector,
    APIResponse,
  ],
  exports: [SearchPipelineService, SearchPipelineStatsService],
})
export class SearchPipelineModule {} 