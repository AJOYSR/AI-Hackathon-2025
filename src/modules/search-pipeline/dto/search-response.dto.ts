import { ApiProperty } from '@nestjs/swagger';
import { SearchResultDto } from './search-result.dto';

export class SearchResponseDto {
  @ApiProperty({
    description: 'List of search results',
    type: [SearchResultDto],
  })
  results: SearchResultDto[];

  @ApiProperty({
    description: 'Enhanced version of the original query',
    required: false,
    example: 'laptop under 1000 with high performance',
  })
  enhancedQuery?: string;

  @ApiProperty({
    description: 'Metadata about the search execution',
    example: {
      processingTime: 150,
      resourceUsage: {
        memory: 1024,
        cpu: 0.5,
      },
    },
  })
  metadata: {
    processingTime: number;
    resourceUsage: {
      memory: number;
      cpu: number;
    };
  };
} 