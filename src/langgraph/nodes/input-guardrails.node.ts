import { BaseNode } from '../core/base.node';
import { NodeInput, SearchState } from '../types/base.types';

export class InputGuardrailsNode extends BaseNode {
  private readonly MAX_QUERY_LENGTH = 1000;
  private readonly MIN_QUERY_LENGTH = 1;
  private readonly ALLOWED_CHARSET = /^[\x20-\x7E]*$/; // Basic ASCII printable characters

  public async process(input: NodeInput): Promise<SearchState> {
    const { state } = input;
    
    // Validate that query exists and is a string
    if (!state.query || typeof state.query !== 'string') {
      return {
        ...state,
        guardrails: {
          ...state.guardrails,
          inputValidation: {
            passed: false,
            checks: {
              length: false,
              charset: false,
              rateLimit: true,
              ipCheck: true,
              syntax: false,
            },
          },
        },
      };
    }

    const guardrails = {
      inputValidation: {
        passed: true,
        checks: {
          length: this.validateLength(state.query),
          charset: this.validateCharset(state.query),
          rateLimit: await this.validateRateLimit(state),
          ipCheck: await this.validateIP(state),
          syntax: this.validateSyntax(state.query),
        },
      },
    };

    // Update guardrails status
    const passed = Object.values(guardrails.inputValidation.checks).every(check => check);
    guardrails.inputValidation.passed = passed;

    return {
      ...state,
      guardrails: {
        ...state.guardrails,
        ...guardrails,
      },
    };
  }

  private validateLength(query: string): boolean {
    const length = query.trim().length;
    return length >= this.MIN_QUERY_LENGTH && length <= this.MAX_QUERY_LENGTH;
  }

  private validateCharset(query: string): boolean {
    return this.ALLOWED_CHARSET.test(query);
  }

  private async validateRateLimit(state: SearchState): Promise<boolean> {
    // TODO: Implement rate limiting logic
    // This could involve checking against Redis or another rate limiting service
    return true;
  }

  private async validateIP(state: SearchState): Promise<boolean> {
    // TODO: Implement IP validation logic
    // This could involve checking against a blocklist or geolocation
    return true;
  }

  private validateSyntax(query: string): boolean {
    // Basic syntax validation
    // TODO: Implement more sophisticated syntax checking
    return query.trim().length > 0;
  }

  public determineNextNode(state: SearchState): string {
    return state.guardrails.inputValidation.passed ? 'query-cache-check' : 'error-handler';
  }
} 