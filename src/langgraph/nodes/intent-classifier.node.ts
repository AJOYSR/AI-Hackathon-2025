import { BaseNode } from '../core/base.node';
import { NodeInput, SearchState } from '../types/base.types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

export class IntentClassifierNode extends BaseNode {
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
        Analyze the following search query and determine the user's intent and relevant parameters.
        The intent should be one of: product_search, price_comparison, product_details, or other.
        
        For product_search, extract:
        - category (if specified)
        - features (if specified)
        - price_range (if specified)
        
        For price_comparison, extract:
        - product_name
        - comparison_type (e.g., "cheapest", "best value")
        
        For product_details, extract:
        - product_id or product_name
        - detail_type (e.g., "specifications", "reviews")
        
        Query: ${state.query}
        
        Respond with a JSON object containing:
        - intent: the classified intent
        - confidence: a number between 0 and 1
        - parameters: an object containing the extracted parameters
        
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
      const parsedResult = JSON.parse(cleanedText);

      // Update the state with the classified intent
      return {
        ...state,
        intent: {
          type: parsedResult.intent,
          confidence: parsedResult.confidence,
          parameters: parsedResult.parameters || {},
        },
        guardrails: {
          ...state.guardrails,
          queryValidation: {
            passed: true,
            checks: {
              semantic: true,
              intent: true,
              complexity: this.checkQueryComplexity(state.query),
              resources: true,
              context: true,
            },
          },
        },
      };
    } catch (error) {
      // If intent classification fails, mark it as failed
      return {
        ...state,
        intent: {
          type: 'unknown',
          confidence: 0,
          parameters: {},
        },
        guardrails: {
          ...state.guardrails,
          queryValidation: {
            passed: false,
            checks: {
              semantic: false,
              intent: false,
              complexity: false,
              resources: false,
              context: false,
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
    if (!state.guardrails.queryValidation.passed) {
      return 'error-handler';
    }
    
    // Route based on intent type
    switch (state.intent.type) {
      case 'product_search':
        return 'search-executor';
      case 'price_comparison':
        return 'price-comparator';
      case 'product_details':
        return 'product-details-fetcher';
      default:
        return 'search-executor'; // Fallback to general search
    }
  }

  private checkQueryComplexity(query: string): boolean {
    // Simple complexity check based on query length and word count
    const words = query.trim().split(/\s+/);
    return words.length >= 2 && words.length <= 20;
  }
} 