import { assertCipher } from '@/ciphers';
import { runPipeline as runEnginePipeline } from './pipelineEngine';
import type { PipelineEngineNode } from './pipelineEngine';
import {
  MIN_PIPELINE_NODES,
  type NodeStepSnapshot,
  type PipelineMode,
  type PipelineNode,
  type PipelineRunResult,
} from './types';

/**
 * Adapter: validates UI minimum nodes, runs {@link runEnginePipeline}, maps steps for the UI.
 */
export function runPipeline(
  nodes: PipelineNode[],
  input: string,
  mode: PipelineMode,
): PipelineRunResult {
  if (nodes.length < MIN_PIPELINE_NODES) {
    throw new Error(`Add at least ${MIN_PIPELINE_NODES} nodes before running the pipeline.`);
  }

  const engineNodes: PipelineEngineNode[] = nodes.map((n) => ({
    type: n.type,
    config: n.config,
  }));

  const { finalOutput, steps: engineSteps } = runEnginePipeline(engineNodes, input, mode);

  const steps: NodeStepSnapshot[] = engineSteps.map((s) => {
    const node = nodes[s.nodeIndex]!;
    const cipher = assertCipher(node.type);
    return makeSnapshot(node, cipher.id, cipher.name, s.input, s.output);
  });

  return { mode, steps, finalOutput };
}

function makeSnapshot(
  node: PipelineNode,
  cipherType: string,
  cipherName: string,
  input: string,
  output: string,
): NodeStepSnapshot {
  return {
    nodeId: node.id,
    cipherType,
    cipherName,
    config: { ...node.config },
    input,
    output,
  };
}

/** Map node id → snapshot for quick lookup in the UI */
export function indexStepsByNodeId(steps: NodeStepSnapshot[]): Map<string, NodeStepSnapshot> {
  const map = new Map<string, NodeStepSnapshot>();
  for (const s of steps) {
    map.set(s.nodeId, s);
  }
  return map;
}
