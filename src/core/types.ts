export const MIN_PIPELINE_NODES = 3;

/** Pipeline step stored in app state (React Flow + engine). */
export interface PipelineNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

export interface NodeStepSnapshot {
  nodeId: string;
  cipherType: string;
  cipherName: string;
  config: Record<string, unknown>;
  input: string;
  output: string;
}

export type PipelineMode = 'encrypt' | 'decrypt';

export interface PipelineRunResult {
  mode: PipelineMode;
  /** Execution order: encrypt is left→right; decrypt is right→left */
  steps: NodeStepSnapshot[];
  finalOutput: string;
}
