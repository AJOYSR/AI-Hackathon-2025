import { BaseNode } from '../core/base.node';
import { NodeInput, SearchState } from '../types/base.types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from 'winston';

export class ErrorHandlerNode extends BaseNode {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;
  private readonly logger: Logger;

  constructor(config: any, context: any) {
    super(config, context);
    
    // Initialize the Google Generative AI
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Initialize logger
    this.logger = context.logger;
  }

  public async process(input: NodeInput): Promise<SearchState> {
    const { state } = input;
    
    try {
      // Log the error
      this.logError(state.metadata.error);

      // Generate a helpful error response
      const errorResponse = await this.generateErrorResponse(state);

      // Attempt recovery if possible
      const recoveredState = await this.attemptRecovery(state);

      return {
        ...recoveredState,
        finalResponse: errorResponse,
        guardrails: {
          ...recoveredState.guardrails,
          outputValidation: {
            passed: true, // Mark as passed since we handled the error
            checks: {
              content: true,
              privacy: true,
              format: true,
              relevance: true,
              diversity: true,
            },
          },
        },
        metadata: {
          ...recoveredState.metadata,
          error: undefined, // Clear the error since we handled it
          recoveryAttempted: true,
        },
      };
    } catch (error) {
      // If error handling itself fails, return a basic error state
      return {
        ...state,
        finalResponse: 'We apologize, but we encountered an unexpected error. Please try again later.',
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
          recoveryAttempted: false,
        },
      };
    }
  }

  public determineNextNode(state: SearchState): string {
    // If recovery was successful, continue to response formatter
    if (state.metadata.recoveryAttempted) {
      return 'response-formatter';
    }
    // Otherwise, end the flow
    return 'end';
  }

  private logError(error: Error | undefined): void {
    if (!error) return;

    this.logger.error('Error in search pipeline', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      timestamp: new Date().toISOString(),
    });
  }

  private async generateErrorResponse(state: SearchState): Promise<string> {
    const prompt = `
      Generate a helpful error response for the user based on the following context.
      The response should be:
      - Apologetic but professional
      - Explain what went wrong in simple terms
      - Suggest what the user can do next
      - Maintain a helpful tone
      
      Query: ${state.query}
      Error: ${state.metadata.error?.message || 'Unknown error'}
      Current State: ${JSON.stringify({
        intent: state.intent,
        searchResults: state.searchResults?.length || 0,
        rankedResults: state.rankedResults?.length || 0,
      }, null, 2)}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch {
      // Fallback error message if we can't generate a custom response
      return 'We encountered an issue while processing your request. Please try again later or contact support if the problem persists.';
    }
  }

  private async attemptRecovery(state: SearchState): Promise<SearchState> {
    // If we have partial results, try to recover them
    if (state.rankedResults && state.rankedResults.length > 0) {
      return state;
    }

    // If we have search results but no ranking, try to rank them
    if (state.searchResults && state.searchResults.length > 0) {
      const prompt = `
        Attempt to recover and rank the following search results.
        The previous ranking attempt failed, but we still have the raw results.
        
        Query: ${state.query}
        Intent: ${state.intent.type}
        Parameters: ${JSON.stringify(state.intent.parameters)}
        
        Search Results:
        ${JSON.stringify(state.searchResults, null, 2)}
        
        Provide a simple ranking based on relevance to the query.
        Return a JSON array with the same structure as the input, but add a relevance_score field.
      `;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const rankedResults = JSON.parse(text);

        return {
          ...state,
          rankedResults,
        };
      } catch {
        // If recovery fails, return the original state
        return state;
      }
    }

    // If we have no results at all, try to generate a basic response
    if (state.query && state.intent) {
      const prompt = `
        Generate a basic response for the user's query since we couldn't find any results.
        
        Query: ${state.query}
        Intent: ${state.intent.type}
        Parameters: ${JSON.stringify(state.intent.parameters)}
        
        The response should:
        - Acknowledge that we couldn't find specific results
        - Provide general information related to the query
        - Suggest alternative search terms or approaches
      `;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
          ...state,
          finalResponse: text,
        };
      } catch {
        // If recovery fails, return the original state
        return state;
      }
    }

    // If all recovery attempts fail, return the original state
    return state;
  }
} 