import { ApiProperty } from '@nestjs/swagger';

export class SearchResultDto {
  @ApiProperty({
    description: 'Unique identifier of the result',
    example: 'product-123',
  })
  id: string;

  @ApiProperty({
    description: 'Relevance score of the result',
    example: 0.95,
  })
  score: number;

  @ApiProperty({
    description: 'Content of the result',
    example: 'High quality product matching your criteria',
  })
  content: string;

  @ApiProperty({
    description: 'Additional metadata about the result',
    example: {
      price: 99.99,
      category: 'electronics',
      rating: 4.5,
    },
  })
  metadata: Record<string, any>;
} 