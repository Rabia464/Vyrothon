import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type OnNodesChange,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { NodeStepSnapshot, PipelineNode } from '@/core/types';
import { NodeCard } from './NodeCard';
import { buildFlowEdges, buildFlowNodes, type CipherFlowNode } from './flow/buildFlowElements';
import './PipelineCanvas.css';

const nodeTypes = { cipherNode: NodeCard };

type Props = {
  pipeline: PipelineNode[];
  steps: NodeStepSnapshot[] | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  cipherName: (type: string) => string;
  configSchema: (type: string) => import('@/ciphers/types').ConfigFieldSchema[];
  onPatchConfig: (id: string, patch: Record<string, unknown>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
};

export function PipelineCanvas({
  pipeline,
  steps,
  selectedNodeId,
  onSelectNode,
  cipherName,
  configSchema,
  onPatchConfig,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const stepByNodeId = useMemo(() => {
    if (!steps) return new Map<string, { input: string; output: string }>();
    const m = new Map<string, { input: string; output: string }>();
    for (const s of steps) {
      m.set(s.nodeId, { input: s.input, output: s.output });
    }
    return m;
  }, [steps]);

  const computedNodes = useMemo(
    () =>
      buildFlowNodes(pipeline, stepByNodeId, {
        cipherName,
        configSchema,
        onPatchConfig,
        onRemove,
        onMoveUp,
        onMoveDown,
      }).map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
      })),
    [
      pipeline,
      stepByNodeId,
      selectedNodeId,
      cipherName,
      configSchema,
      onPatchConfig,
      onRemove,
      onMoveUp,
      onMoveDown,
    ],
  );

  const computedEdges = useMemo(() => buildFlowEdges(pipeline), [pipeline]);

  const [nodes, setNodes, onNodesChange] = useNodesState<CipherFlowNode>(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

  useEffect(() => {
    setEdges(computedEdges);
  }, [computedEdges, setEdges]);

  const handleNodesChange: OnNodesChange<CipherFlowNode> = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  return (
    <div className="pipelineCanvasWrap panel">
      <header className="panelHeader">
        <h2 className="panelTitle">Pipeline</h2>
        <span className="chip mono">
          nodes: <strong>{pipeline.length}</strong>
        </span>
      </header>
      <div className="pipelineCanvasRf">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, n) => onSelectNode(n.id)}
          onPaneClick={() => onSelectNode(null)}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.4}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="rgba(120,130,160,0.25)" />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="ncMinimap" />
        </ReactFlow>
      </div>
    </div>
  );
}
