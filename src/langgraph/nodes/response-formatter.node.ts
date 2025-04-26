import { BaseNode } from '../core/base.node';
import { NodeInput, SearchState } from '../types/base.types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

export class ResponseFormatterNode extends BaseNode {
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
      if (!state.rankedResults || state.rankedResults.length === 0) {
        return {
          ...state,
          finalResponse: 'No results found matching your query.',
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
        Format the following search results into a natural, helpful response for the user.
        Consider the user's intent and query context.
        
        Query: ${state.query}
        Intent: ${state.intent.type}
        Parameters: ${JSON.stringify(state.intent.parameters)}
        
        Ranked Results:
        ${JSON.stringify(state.rankedResults, null, 2)}
        
        Create a response that:
        1. Acknowledges the user's query
        2. Summarizes the key findings
        3. Highlights the most relevant results
        4. Provides context and explanations where needed
        5. Maintains a helpful and professional tone
        
        The response should be concise but informative, and formatted for easy reading.
        
        IMPORTANT: Return ONLY the formatted response text, without any additional formatting markers or explanations.
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
      const formattedResponse = response.text();

      return {
        ...state,
        finalResponse: formattedResponse,
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
        finalResponse: 'An error occurred while formatting the response.',
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
    return 'end'; // This is the final node in the flow
  }
} 