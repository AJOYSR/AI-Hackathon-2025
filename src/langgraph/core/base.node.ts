import { NodeConfig, NodeContext, NodeInput, NodeOutput, SearchState } from '../types/base.types';

export abstract class BaseNode {
  public readonly config: NodeConfig;
  protected readonly context: NodeContext;

  constructor(config: NodeConfig, context: NodeContext) {
    this.config = config;
    this.context = context;
  }

  public abstract process(input: NodeInput): Promise<SearchState>;

  public abstract determineNextNode(state: SearchState): string;

  protected async executeWithRetry(input: NodeInput): Promise<SearchState> {
    let attempts = 0;
    const maxAttempts = this.config.retryAttempts || 3;

    while (attempts < maxAttempts) {
      try {
        return await this.process(input);
      } catch (error) {
        attempts++;
        if (attempts === maxAttempts) {
          this.context.logger.error(`Failed to execute node ${this.config.name} after ${maxAttempts} attempts`, error);
          throw error;
        }
        this.context.logger.warn(`Retrying node ${this.config.name}, attempt ${attempts}`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
      }
    }

    throw new Error(`Failed to execute node ${this.config.name} after ${maxAttempts} attempts`);
  }

  public async execute(input: NodeInput): Promise<NodeOutput> {
    const startTime = Date.now();
    let nextNode = '';

    try {
      // Update metadata with start time
      const state = {
        ...input.state,
        metadata: {
          ...input.state.metadata,
          timestamp: startTime,
        },
      };

      // Process the node
      const updatedState = await this.process({ ...input, state });

      // Update metadata with processing time
      const finalState = {
        ...updatedState,
        metadata: {
          ...updatedState.metadata,
          processingTime: Date.now() - startTime,
        },
      };

      // Determine next node
      nextNode = this.determineNextNode(finalState);

      return {
        state: finalState,
        next: nextNode,
      };
    } catch (error) {
      // Handle errors and update state
      const errorState = {
        ...input.state,
        metadata: {
          ...input.state.metadata,
          error: error as Error,
          processingTime: Date.now() - startTime,
        },
      };

      // Use fallback strategy if available
      if (this.config.fallbackStrategy) {
        nextNode = this.config.fallbackStrategy.type;
      }

      return {
        state: errorState,
        next: nextNode,
      };
    }
  }

  protected validateState(state: SearchState): boolean {
    // Basic state validation - can be extended by child classes
    return !!state.query && !!state.intent;
  }
} 