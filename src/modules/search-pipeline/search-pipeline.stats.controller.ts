import { Controller, Get, Param } from '@nestjs/common';
import { SearchPipelineStatsService } from './search-pipeline.stats.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Search Pipeline Statistics')
@Controller('search-pipeline/stats')
export class SearchPipelineStatsController {
  constructor(private readonly statsService: SearchPipelineStatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get overall pipeline statistics' })
  @ApiResponse({ status: 200, description: 'Returns pipeline statistics' })
  async getPipelineStats() {
    return this.statsService.getPipelineStats();
  }

  @Get('node/:nodeName')
  @ApiOperation({ summary: 'Get statistics for a specific node' })
  @ApiResponse({ status: 200, description: 'Returns node-specific statistics' })
  async getNodeStats(@Param('nodeName') nodeName: string) {
    return this.statsService.getNodeStats(nodeName);
  }

  @Get('cost-analysis')
  @ApiOperation({ summary: 'Get cost analysis and optimization suggestions' })
  @ApiResponse({ status: 200, description: 'Returns cost analysis data' })
  async getCostAnalysis() {
    return this.statsService.getCostAnalysis();
  }
} 