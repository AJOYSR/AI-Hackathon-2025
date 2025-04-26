import { GraphVisualizer } from './graph-visualizer';

// Create an instance of the visualizer
const visualizer = new GraphVisualizer();

// Example state
const exampleState = {
  query: "Find me a laptop under $1000",
  intent: {
    type: "product_search",
    parameters: {
      category: "laptop",
      price_range: "under $1000"
    }
  },
  currentNode: "Intent Classifier"
};

// Visualize the graph
console.log("Basic Graph Visualization:");
visualizer.visualize();

// Visualize with state
console.log("\nGraph with Current State:");
visualizer.visualizeWithState(exampleState); 