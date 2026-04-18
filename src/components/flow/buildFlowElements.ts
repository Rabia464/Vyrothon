import type { Edge, Node } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { ConfigFieldSchema } from '@/ciphers/types';
import type { PipelineNode } from '@/core/types';

const NODE_X_GAP = 300;
const NODE_Y = 32;

export type CipherFlowNodeData = {
  cipherName: string;
  cipherType: string;
  config: Record<string, unknown>;
  input: string;
  output: string;
  configSchema: ConfigFieldSchema[];
  index: number;
  total: number;
  onPatchConfig: (patch: Record<string, unknown>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export type CipherFlowNode = Node<CipherFlowNodeData, 'cipherNode'>;

export function buildFlowNodes(
  pipeline: PipelineNode[],
  stepByNodeId: Map<string, { input: string; output: string }>,
  opts: {
    cipherName: (type: string) => string;
    configSchema: (type: string) => ConfigFieldSchema[];
    onPatchConfig: (id: string, patch: Record<string, unknown>) => void;
    onRemove: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
  },
): CipherFlowNode[] {
  return pipeline.map((n, index) => {
    const snap = stepByNodeId.get(n.id);
    return {
      id: n.id,
      type: 'cipherNode',
      position: { x: index * NODE_X_GAP, y: NODE_Y },
      data: {
        cipherName: opts.cipherName(n.type),
        cipherType: n.type,
        config: n.config,
        input: snap?.input ?? '—',
        output: snap?.output ?? '—',
        configSchema: opts.configSchema(n.type),
        index,
        total: pipeline.length,
        onPatchConfig: (patch) => opts.onPatchConfig(n.id, patch),
        onRemove: () => opts.onRemove(n.id),
        onMoveUp: () => opts.onMoveUp(n.id),
        onMoveDown: () => opts.onMoveDown(n.id),
      },
    };
  });
}

export function buildFlowEdges(pipeline: PipelineNode[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < pipeline.length - 1; i++) {
    const a = pipeline[i]!;
    const b = pipeline[i + 1]!;
    edges.push({
      id: `e-${a.id}-${b.id}`,
      source: a.id,
      target: b.id,
      markerEnd: { type: MarkerType.ArrowClosed, width: 22, height: 22 },
      style: { stroke: 'rgba(108, 140, 255, 0.55)', strokeWidth: 2 },
    });
  }
  return edges;
}
