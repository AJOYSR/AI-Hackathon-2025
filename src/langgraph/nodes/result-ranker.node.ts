import { BaseNode } from '../core/base.node';
import { NodeInput, SearchState, SearchResult, RankedResult } from '../types/base.types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

export class ResultRankerNode extends BaseNode {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;

  constructor(config: any, context: any) {
    super(config, context);
    
    // Initialize the Google Generative AI with the same API key configuration
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  public async process(input: NodeInput): Promise<SearchState> {
    const { state } = input;
    
    try {
      if (!state.searchResults || state.searchResults.length === 0) {
        return {
          ...state,
          rankedResults: [],
          guardrails: {
            ...state.guardrails,
            outputValidation: {
              passed: false,
              checks: {
                content: false,
                privacy: false,
                format: false,
                relevance: false,
                diversity: false,
              },
            },
          },
        };
      }

      const prompt = `
        Analyze and rank the following search results based on the user's query and intent.
        Consider relevance, quality, and user preferences.
        
        Query: ${state.query}
        Intent: ${state.intent.type}
        Parameters: ${JSON.stringify(state.intent.parameters)}
        
        Search Results:
        ${JSON.stringify(state.searchResults, null, 2)}
        
        For each result, provide:
        - relevance_score: number between 0 and 1
        - quality_score: number between 0 and 1
        - diversity_score: number between 0 and 1
        - ranking_explanation: brief explanation of the ranking
        
        Respond with a JSON array of ranked results, maintaining the same structure as the input but adding the scoring fields.
        
        IMPORTANT: Return ONLY the JSON array, without any markdown formatting or additional text.
      `;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      });

      const response = result.response;
      const text = response.text();
      
      // Clean the response text to ensure it's valid JSON
      const cleanedText = text
        .replace(/```json\n?/g, '') // Remove markdown code block markers
        .replace(/```\n?/g, '')     // Remove any remaining backticks
        .trim();                    // Remove any leading/trailing whitespace
      
      // Parse the JSON response
      const rankedResults: RankedResult[] = JSON.parse(cleanedText);

      // Sort results by relevance score
      rankedResults.sort((a, b) => b.relevance_score - a.relevance_score);

      // Apply diversity threshold (remove results too similar to higher-ranked ones)
      const filteredResults = this.applyDiversityFilter(rankedResults);

      return {
        ...state,
        rankedResults: filteredResults,
        guardrails: {
          ...state.guardrails,
          outputValidation: {
            passed: true,
            checks: {
              content: true,
              privacy: true,
              format: true,
              relevance: true,
              diversity: true,
            },
          },
        },
      };
    } catch (error) {
      return {
        ...state,
        rankedResults: [],
        guardrails: {
          ...state.guardrails,
          outputValidation: {
            passed: false,
            checks: {
              content: false,
              privacy: false,
              format: false,
              relevance: false,
              diversity: false,
            },
          },
        },
        metadata: {
          ...state.metadata,
          error: error as Error,
        },
      };
    }
  }

  public determineNextNode(state: SearchState): string {
    if (!state.guardrails.outputValidation.passed) {
      return 'error-handler';
    }
    return 'response-formatter';
  }

  private applyDiversityFilter(results: RankedResult[]): RankedResult[] {
    const filteredResults: RankedResult[] = [];
    const similarityThreshold = 0.7; // Adjust based on requirements

    for (const result of results) {
      // Check if this result is too similar to any already included result
      const isTooSimilar = filteredResults.some(existing => 
        this.calculateSimilarity(result, existing) > similarityThreshold
      );

      if (!isTooSimilar) {
        filteredResults.push(result);
      }
    }

    return filteredResults;
  }

  private calculateSimilarity(result1: RankedResult, result2: RankedResult): number {
    // Simple similarity calculation based on content and metadata
    // This could be enhanced with more sophisticated similarity measures
    const contentSimilarity = this.calculateTextSimilarity(
      result1.content,
      result2.content
    );

    const metadataSimilarity = this.calculateMetadataSimilarity(
      result1.metadata,
      result2.metadata
    );

    return (contentSimilarity + metadataSimilarity) / 2;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple text similarity using Jaccard similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private calculateMetadataSimilarity(metadata1: any, metadata2: any): number {
    // Calculate similarity between metadata objects
    const keys = new Set([...Object.keys(metadata1), ...Object.keys(metadata2)]);
    let matches = 0;
    let total = 0;

    for (const key of keys) {
      if (metadata1[key] !== undefined && metadata2[key] !== undefined) {
        total++;
        if (metadata1[key] === metadata2[key]) {
          matches++;
        }
      }
    }

    return total > 0 ? matches / total : 0;
  }
} 