# LangGraph Usage Guide

## Basic Usage

### 1. Creating a Graph
```typescript
import { createGraphConfig } from '../langgraph/graph.config';

const graphConfig = createGraphConfig();
```

### 2. Executing a Query
```typescript
import { GraphExecutor } from '../langgraph/core/graph.executor';

const executor = new GraphExecutor(graphConfig);
const result = await executor.execute({
  query: "Find me a laptop under $1000"
});
```

## Node Configuration

### Input Guardrails Node
```typescript
const config = {
  maxQueryLength: 1000,
  allowedCharacters: /[a-zA-Z0-9\s.,!?-]/,
  blacklistedTerms: ['malicious', 'injection']
};
```

### Query Cache Check Node
```typescript
const config = {
  redisUrl: process.env.REDIS_URL,
  cacheTTL: 3600 // 1 hour
};
```

### Intent Classifier Node
```typescript
const config = {
  modelName: 'gemini-pro',
  confidenceThreshold: 0.7
};
```

## Error Handling

### Custom Error Handler
```typescript
class CustomErrorHandler extends ErrorHandlerNode {
  protected async handleError(error: Error, state: SearchState): Promise<SearchState> {
    // Custom error handling logic
    return {
      ...state,
      error: error.message,
      fallbackResponse: "Custom error message"
    };
  }
}
```

## Monitoring

### Logging Configuration
```typescript
import { Logger } from '../langgraph/utils/logger';

const logger = new Logger({
  level: 'info',
  format: 'json',
  destination: 'file'
});
```

### Metrics Collection
```typescript
import { MetricsCollector } from '../langgraph/utils/metrics.collector';

const metrics = new MetricsCollector();
metrics.recordNodeExecution('intent-classifier', 150); // ms
```

## API Integration

### REST Endpoint
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { GraphExecutor } from '../langgraph/core/graph.executor';

@Controller('search')
export class SearchController {
  constructor(private readonly executor: GraphExecutor) {}

  @Post()
  async search(@Body() query: { text: string }) {
    return this.executor.execute({ query: query.text });
  }
}
```

### WebSocket Support
```typescript
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway()
export class SearchGateway {
  @WebSocketServer()
  server: Server;

  async handleSearch(query: string) {
    const result = await this.executor.execute({ query });
    this.server.emit('searchResult', result);
  }
}
```

## Best Practices

1. **Error Handling**
   - Always implement proper error handling in custom nodes
   - Use the Error Handler node for centralized error management
   - Log errors with sufficient context

2. **State Management**
   - Keep state updates atomic
   - Validate state transitions
   - Preserve important metadata

3. **Performance**
   - Implement caching where appropriate
   - Monitor node execution times
   - Optimize heavy operations

4. **Testing**
   - Unit test each node independently
   - Verify state transitions
   - Test error scenarios

## Common Patterns

### Adding a Custom Node
```typescript
class CustomNode extends BaseNode {
  public async process(input: NodeInput): Promise<SearchState> {
    // Implementation
  }

  public determineNextNode(state: SearchState): string {
    // Routing logic
  }
}
```

### Extending State
```typescript
interface CustomState extends SearchState {
  customField: string;
  customMetadata: {
    // Additional metadata
  };
}
```

### Custom Routing
```typescript
class CustomRouter extends BaseNode {
  public determineNextNode(state: SearchState): string {
    if (state.someCondition) {
      return 'custom-node';
    }
    return super.determineNextNode(state);
  }
}
``` 