import { Injectable } from '@nestjs/common';
import { QnAService } from '../qna/qna.service';
import { GraphExecutor } from '../../langgraph/core/graph.executor';
import { SearchState } from '../../langgraph/types/base.types';
import { SearchVectorByQueryDto } from '../qna/dto/qna.dto';
import { SearchResponseDto } from './dto/search-response.dto';
import { SearchResultDto } from './dto/search-result.dto';

@Injectable()
export class SearchPipelineService {
  constructor(
    private readonly qnaService: QnAService,
    private readonly graphExecutor: GraphExecutor,
  ) {}

  private mapToSearchResultDto(result: any): SearchResultDto {
    return {
      id: result.id,
      score: result.combined_score || result.cosine_similarity || 0,
      content: result.title || '',
      metadata: {
        category: result.category,
        brand: result.brand,
        cluster_id: result.cluster_id,
        description: result.description,
        spectablecontent: result.spectablecontent,
        price: result.price,
        cosine_similarity: result.cosine_similarity,
        cosine_score: result.cosine_score,
        hybrid_score: result.hybrid_score,
        combined_score: result.combined_score
      },
    };
  }

  async processSearch(query: string, businessId?: string): Promise<SearchResponseDto> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    try {
      // Execute the LangGraph pipeline to get enhanced query and intent
      const graphResult = await this.graphExecutor.execute(query, {
        requestId: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });

      // Use the enhanced query and intent from LangGraph to perform actual search
      const searchDto: SearchVectorByQueryDto = {
        businessId,
        limit: 10,
        question: graphResult.enhancedQuery || query,
      };

      // Perform the actual search using QnA service
      const searchResults = await this.qnaService.searchCosineByQuery(
        searchDto,
        graphResult.intent,
      );

      // Map the results to DTO format
      const mappedResults = searchResults.data.map(this.mapToSearchResultDto);

      return {
        results: mappedResults,
        enhancedQuery: graphResult.enhancedQuery,
        metadata: {
          processingTime: graphResult.metadata.processingTime,
          resourceUsage: graphResult.metadata.resourceUsage,
        },
      };
    } catch (error) {
      // If the pipeline fails, fall back to basic QnA search
      const searchDto: SearchVectorByQueryDto = {
        businessId,
        limit: 10,
        question: query,
      };

      const searchResults = await this.qnaService.searchCosineByQuery(
        searchDto,
        { type: 'unknown', confidence: 0, parameters: {} },
      );
      const mappedResults = searchResults.data.map(this.mapToSearchResultDto);

      return {
        results: mappedResults,
        metadata: {
          processingTime: 0,
          resourceUsage: {
            memory: 0,
            cpu: 0,
          },
        },
      };
    }
  }
} 