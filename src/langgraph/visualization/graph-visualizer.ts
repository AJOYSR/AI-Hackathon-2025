import { GraphConfig } from '../types/base.types';

export class GraphVisualizer {
  private readonly nodes: string[] = [
    'Input Guardrails',
    'Query Cache Check',
    'Intent Classifier',
    'Search Executor',
    'Result Ranker',
    'Response Formatter',
    'Error Handler'
  ];

  private readonly edges: { from: string; to: string; type: 'normal' | 'error' }[] = [
    { from: 'Input Guardrails', to: 'Query Cache Check', type: 'normal' },
    { from: 'Query Cache Check', to: 'Intent Classifier', type: 'normal' },
    { from: 'Intent Classifier', to: 'Search Executor', type: 'normal' },
    { from: 'Search Executor', to: 'Result Ranker', type: 'normal' },
    { from: 'Result Ranker', to: 'Response Formatter', type: 'normal' },
    { from: 'Input Guardrails', to: 'Error Handler', type: 'error' },
    { from: 'Query Cache Check', to: 'Error Handler', type: 'error' },
    { from: 'Intent Classifier', to: 'Error Handler', type: 'error' },
    { from: 'Search Executor', to: 'Error Handler', type: 'error' },
    { from: 'Result Ranker', to: 'Error Handler', type: 'error' },
    { from: 'Response Formatter', to: 'Error Handler', type: 'error' }
  ];

  public visualize(): void {
    console.log('\nLangGraph Visualization\n');
    console.log('Flow:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    
    // Main flow
    this.nodes.slice(0, -1).forEach((node, index) => {
      console.log(`│ ${node.padEnd(30)} ──────> ${this.nodes[index + 1].padEnd(30)} │`);
    });

    console.log('└─────────────────────────────────────────────────────────────┘');
    
    // Error paths
    console.log('\nError Paths:');
    this.edges
      .filter(edge => edge.type === 'error')
      .forEach(edge => {
        console.log(`┌─ ${edge.from.padEnd(30)} ──────> ${edge.to.padEnd(30)} ─┐`);
      });
    
    console.log('\nLegend:');
    console.log('──────> Normal flow');
    console.log('──────> Error path');
  }

  public visualizeWithState(state: any): void {
    this.visualize();
    console.log('\nCurrent State:');
    console.log(JSON.stringify(state, null, 2));
  }
} 