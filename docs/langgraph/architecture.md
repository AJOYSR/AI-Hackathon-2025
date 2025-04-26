# LangGraph Architecture

## Overview
LangGraph is a directed acyclic graph (DAG) implementation for processing search queries through a series of specialized nodes. Each node in the graph performs a specific function and can route to different nodes based on the processing results.

## Core Components

### 1. Base Node
- Abstract base class for all nodes
- Provides common functionality and interfaces
- Manages node configuration and context
- Defines the contract for node processing and routing

### 2. Node Types

#### Input Guardrails Node
- Validates and sanitizes user input
- Implements security checks
- Prevents malicious or invalid queries
- Routes to Query Cache or Error Handler

#### Query Cache Check Node
- Checks Redis cache for previous results
- Implements cache key generation
- Manages cache TTL and updates
- Routes to Intent Classifier or Response Formatter

#### Intent Classifier Node
- Uses Gemini AI to classify query intent
- Extracts relevant parameters
- Validates query complexity
- Routes to appropriate executor based on intent

#### Search Executor Node
- Executes the actual product search
- Enhances queries with additional context
- Implements search algorithms
- Routes to Result Ranker or Error Handler

#### Result Ranker Node
- Ranks search results by relevance
- Applies diversity filtering
- Calculates similarity scores
- Routes to Response Formatter or Error Handler

#### Response Formatter Node
- Formats results into user-friendly responses
- Ensures consistent output format
- Adds contextual information
- Routes to end or Error Handler

#### Error Handler Node
- Centralized error management
- Provides fallback responses
- Attempts recovery when possible
- Logs errors for monitoring

### 3. State Management
- Maintains state throughout the graph execution
- Includes query, intent, results, and metadata
- Tracks validation and error states
- Preserves context between nodes

### 4. Graph Configuration
- Defines node connections and routing
- Manages execution flow
- Handles error paths
- Configures node-specific settings

## Data Flow

1. User Query → Input Guardrails
2. Input Guardrails → Query Cache Check
3. Query Cache Check → Intent Classifier (if no cache hit)
4. Intent Classifier → Search Executor
5. Search Executor → Result Ranker
6. Result Ranker → Response Formatter
7. Response Formatter → End

Error paths exist from each node to the Error Handler.

## Logging and Monitoring
- Comprehensive logging at each node
- Performance metrics collection
- Error tracking and reporting
- State transition logging
- Redis cache monitoring
- Gemini AI API monitoring

## Error Handling
- Each node implements error handling
- Errors are routed to the Error Handler
- Error Handler provides fallback responses
- Errors are logged for monitoring
- Circuit breakers for external services
- Graceful degradation strategies

## API Integration
- RESTful endpoints for search queries
- WebSocket support for real-time updates
- Rate limiting and request validation
- API key authentication
- Response caching headers
- Health check endpoints 