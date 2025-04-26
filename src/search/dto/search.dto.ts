import { ApiProperty } from '@nestjs/swagger';

export class SearchRequestDto {
  @ApiProperty({
    description: 'The search query string',
    example: 'find a laptop under $1000',
    required: true,
  })
  query: string;
}

export class ValidationChecksBaseDto {
  @ApiProperty({ description: 'Length validation check', example: true })
  length: boolean;

  @ApiProperty({ description: 'Character set validation check', example: true })
  charset: boolean;

  @ApiProperty({ description: 'Rate limit validation check', example: true })
  rateLimit: boolean;

  @ApiProperty({ description: 'IP validation check', example: true })
  ipCheck: boolean;

  @ApiProperty({ description: 'Syntax validation check', example: true })
  syntax: boolean;
}

export class QueryValidationChecksDto {
  @ApiProperty({ description: 'Semantic validation check', example: true })
  semantic: boolean;

  @ApiProperty({ description: 'Intent validation check', example: true })
  intent: boolean;

  @ApiProperty({ description: 'Complexity validation check', example: true })
  complexity: boolean;

  @ApiProperty({ description: 'Resources validation check', example: true })
  resources: boolean;

  @ApiProperty({ description: 'Context validation check', example: true })
  context: boolean;
}

export class OutputValidationChecksDto {
  @ApiProperty({ description: 'Content validation check', example: true })
  content: boolean;

  @ApiProperty({ description: 'Privacy validation check', example: true })
  privacy: boolean;

  @ApiProperty({ description: 'Format validation check', example: true })
  format: boolean;

  @ApiProperty({ description: 'Relevance validation check', example: true })
  relevance: boolean;

  @ApiProperty({ description: 'Diversity validation check', example: true })
  diversity: boolean;
}

export class GuardrailsBaseDto {
  @ApiProperty({ description: 'Whether validation passed', example: true })
  passed: boolean;
}

export class InputGuardrailsDto extends GuardrailsBaseDto {
  @ApiProperty({ type: ValidationChecksBaseDto })
  checks: ValidationChecksBaseDto;
}

export class QueryGuardrailsDto extends GuardrailsBaseDto {
  @ApiProperty({ type: QueryValidationChecksDto })
  checks: QueryValidationChecksDto;
}

export class OutputGuardrailsDto extends GuardrailsBaseDto {
  @ApiProperty({ type: OutputValidationChecksDto })
  checks: OutputValidationChecksDto;
}

export class SearchResultDto {
  @ApiProperty({ description: 'Unique identifier for the result', example: '1' })
  id: string;

  @ApiProperty({ description: 'Relevance score', example: 0.95 })
  score: number;

  @ApiProperty({ description: 'Content of the result', example: 'Product 1 - High quality laptop under $1000' })
  content: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { price: 999.99, category: 'electronics', rating: 4.5 },
  })
  metadata: Record<string, any>;
}

export class RankedResultDto extends SearchResultDto {
  @ApiProperty({ description: 'Relevance score', example: 0.95 })
  relevance_score: number;

  @ApiProperty({ description: 'Quality score', example: 0.88 })
  quality_score: number;

  @ApiProperty({ description: 'Diversity score', example: 0.75 })
  diversity_score: number;

  @ApiProperty({
    description: 'Explanation of the ranking',
    example: 'High relevance due to matching specifications and price range',
  })
  ranking_explanation: string;
}

export class SearchResponseDto {
  @ApiProperty({ description: 'Original search query', example: 'find a laptop under $1000' })
  query: string;

  @ApiProperty({ description: 'Enhanced search query', example: 'laptop computer portable under $1000 budget' })
  enhancedQuery: string;

  @ApiProperty({
    description: 'Intent classification',
    example: { type: 'product_search', confidence: 0.95, parameters: { price_max: 1000, category: 'laptop' } },
  })
  intent: {
    type: string;
    confidence: number;
    parameters: Record<string, any>;
  };

  @ApiProperty({ type: [SearchResultDto] })
  searchResults: SearchResultDto[];

  @ApiProperty({ type: [RankedResultDto] })
  rankedResults: RankedResultDto[];

  @ApiProperty({
    description: 'Final formatted response',
    example: 'I found several laptops under $1000 that match your requirements...',
  })
  finalResponse: string;

  @ApiProperty({
    description: 'Cache information',
    example: { queryHit: false, resultHit: false, cacheKey: 'search:laptop:1000', timestamp: 1682489200000 },
  })
  cache: {
    queryHit: boolean;
    resultHit: boolean;
    cacheKey: string;
    timestamp: number;
  };

  @ApiProperty({
    description: 'Guardrails validation results',
    type: 'object',
  })
  guardrails: {
    inputValidation: InputGuardrailsDto;
    queryValidation: QueryGuardrailsDto;
    outputValidation: OutputGuardrailsDto;
  };

  @ApiProperty({
    description: 'Execution metadata',
    example: {
      timestamp: 1682489200000,
      processingTime: 250,
      resourceUsage: { memory: 100, cpu: 50, network: 20 },
    },
  })
  metadata: {
    timestamp: number;
    processingTime: number;
    resourceUsage: {
      memory: number;
      cpu: number;
      network: number;
    };
    error?: Error;
    recoveryAttempted?: boolean;
  };
} 