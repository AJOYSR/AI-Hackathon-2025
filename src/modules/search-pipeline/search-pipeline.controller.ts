import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchPipelineService } from './search-pipeline.service';
import { SearchResponseDto } from './dto/search-response.dto';

@ApiTags('Search')
@Controller('search')
export class SearchPipelineController {
  constructor(private readonly searchPipelineService: SearchPipelineService) {}

  @Get()
  @ApiOperation({ summary: 'Search for products' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query',
    example: 'laptop under 1000',
  })
  @ApiQuery({
    name: 'businessId',
    required: false,
    description: 'Optional business ID to filter results',
    example: '75e22ed8-d8c8-47db-81c9-97304068311c',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - query parameter is required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async search(
    @Query('q') query: string,
    @Query('businessId') businessId?: string,
  ): Promise<SearchResponseDto> {
    if (!query) {
      throw new Error('Query parameter "q" is required');
    }

    return this.searchPipelineService.processSearch(query, businessId);
  }
} 