import { NodeConfig, NodeContext, NodeInput, NodeOutput, SearchState } from '../types/base.types';

export abstract class BaseNode {
  public config: NodeConfig;
  protected context: NodeContext;

  constructor(config: NodeConfig, context: NodeContext) {
    this.config = config;
    this.context = context;
  }

  public async process(input: NodeInput): Promise<SearchState> {
    throw new Error('process method must be implemented by subclass');
  }

  public determineNextNode(state: SearchState): string {
    throw new Error('determineNextNode method must be implemented by subclass');
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
        nextNode = this.config.fallbackStrategy;
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