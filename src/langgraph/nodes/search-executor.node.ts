import { BaseNode } from '../core/base.node';
import { NodeInput, SearchState, SearchResult } from '../types/base.types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

export class SearchExecutorNode extends BaseNode {
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
      const prompt = `
        Based on the following search query and intent, generate a structured search request.
        
        Query: ${state.query}
        Intent: ${state.intent.type}
        Parameters: ${JSON.stringify(state.intent.parameters)}
        
        Respond with a JSON object containing:
        - search_terms: array of search terms to use
        - filters: object containing filter criteria
        - sort_by: array of sorting criteria
        
        IMPORTANT: Return ONLY the JSON object, without any markdown formatting or additional text.
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
      const searchRequest = JSON.parse(cleanedText);

      // TODO: Replace with actual search implementation
      // This is a mock implementation
      const mockResults: SearchResult[] = [
        {
          id: '1',
          score: 0.95,
          content: 'Product 1 - High quality product matching your criteria',
          metadata: {
            price: 99.99,
            category: 'electronics',
            rating: 4.5,
          },
        },
        {
          id: '2',
          score: 0.85,
          content: 'Product 2 - Alternative option with good features',
          metadata: {
            price: 79.99,
            category: 'electronics',
            rating: 4.0,
          },
        },
      ];

      return {
        ...state,
        searchResults: mockResults,
        enhancedQuery: this.enhanceQuery(state.query, searchRequest),
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
        searchResults: [],
        enhancedQuery: state.query,
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
    return 'result-ranker';
  }

  private enhanceQuery(originalQuery: string, searchRequest: any): string {
    // Enhance the query based on the search request
    const enhancedTerms = [
      originalQuery,
      ...searchRequest.search_terms,
    ].join(' ');
    
    return enhancedTerms;
  }
} 