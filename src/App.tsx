import { useCallback, useMemo, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { defaultConfigFor, getCipherById } from '@/ciphers';
// Pipeline execution goes through `core/pipeline.ts`, which calls `pipelineEngine.runPipeline` only.
import { runPipeline } from '@/core/pipeline';
import type { CipherType } from '@/core/cipherRegistry';
import type { NodeStepSnapshot, PipelineMode, PipelineNode } from '@/core/types';
import { MIN_PIPELINE_NODES } from '@/core/types';
import { validatePipelineNodes } from '@/core/validatePipeline';
import { ConfigPanel } from '@/components/ConfigPanel';
import { IoPanel } from '@/components/IoPanel';
import { PipelineCanvas } from '@/components/PipelineCanvas';
import { PipelineToolbar } from '@/components/PipelineToolbar';
import './App.css';

function newNodeId(): string {
  return crypto.randomUUID();
}

export function App() {
  const [nodes, setNodes] = useState<PipelineNode[]>([]);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [input, setInput] = useState('Hello CipherStack — cascade encryption demo! 🔐');
  const [mode, setMode] = useState<PipelineMode>('encrypt');

  const [steps, setSteps] = useState<NodeStepSnapshot[] | null>(null);
  const [finalOutput, setFinalOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearRun = useCallback(() => {
    setSteps(null);
    setFinalOutput('');
    setError(null);
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const addNode = useCallback(
    (type: CipherType) => {
      const cipher = getCipherById(type);
      if (!cipher) return;

      const node: PipelineNode = {
        id: newNodeId(),
        type,
        config: defaultConfigFor(cipher),
      };

      setNodes((prev) => [...prev, node]);
      setSelectedNodeId(node.id);
      clearRun();
    },
    [clearRun],
  );

  const removeNode = useCallback(
    (id: string) => {
      const prev = nodesRef.current;
      const idx = prev.findIndex((n) => n.id === id);
      const next = prev.filter((n) => n.id !== id);
      setNodes(next);

      setSelectedNodeId((sel) => {
        if (sel !== id) return sel;
        const pick = Math.max(0, idx - 1);
        return next[pick]?.id ?? null;
      });

      clearRun();
    },
    [clearRun],
  );

  const moveNodeUp = useCallback(
    (id: string) => {
      setNodes((prev) => {
        const i = prev.findIndex((n) => n.id === id);
        if (i <= 0) return prev;
        const next = [...prev];
        [next[i - 1]!, next[i]!] = [next[i]!, next[i - 1]!];
        return next;
      });
      clearRun();
    },
    [clearRun],
  );

  const moveNodeDown = useCallback(
    (id: string) => {
      setNodes((prev) => {
        const i = prev.findIndex((n) => n.id === id);
        if (i < 0 || i >= prev.length - 1) return prev;
        const next = [...prev];
        [next[i]!, next[i + 1]!] = [next[i + 1]!, next[i]!];
        return next;
      });
      clearRun();
    },
    [clearRun],
  );

  const patchNodeConfig = useCallback(
    (nodeId: string, patch: Record<string, unknown>) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, ...patch } } : n)),
      );
      clearRun();
    },
    [clearRun],
  );

  const cipherName = useCallback((t: string) => getCipherById(t)?.name ?? t, []);
  const configSchema = useCallback((t: string) => getCipherById(t)?.configSchema ?? [], []);

  const canRun = nodes.length >= MIN_PIPELINE_NODES;

  const run = useCallback(() => {
    setError(null);
    const cfgErr = validatePipelineNodes(nodes);
    if (cfgErr) {
      setSteps(null);
      setFinalOutput('');
      setError(cfgErr);
      return;
    }
    try {
      const result = runPipeline(nodes, input, mode);
      setSteps(result.steps);
      setFinalOutput(result.finalOutput);
    } catch (e) {
      setSteps(null);
      setFinalOutput('');
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [input, mode, nodes]);

  return (
    <div className="appShell">
      <header className="appHeader">
        <div>
          <h1 className="appTitle">CipherStack</h1>
          <p className="appSubtitle">
            Drag-free React Flow canvas: build a left-to-right cascade, configure each step, then run encrypt or decrypt
            via the shared pipeline engine.
          </p>
        </div>
      </header>

      <div className="layout layoutFlow">
        <div className="leftCol">
          <PipelineToolbar onAdd={addNode} />
        </div>

        <div className="centerCol centerColFlow">
          <ReactFlowProvider>
            <PipelineCanvas
              pipeline={nodes}
              steps={steps}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              cipherName={cipherName}
              configSchema={configSchema}
              onPatchConfig={patchNodeConfig}
              onRemove={removeNode}
              onMoveUp={moveNodeUp}
              onMoveDown={moveNodeDown}
            />
          </ReactFlowProvider>
          <IoPanel
            input={input}
            onInputChange={(next) => {
              setInput(next);
              clearRun();
            }}
            mode={mode}
            onModeChange={(m) => {
              setMode(m);
              setError(null);
            }}
            finalOutput={finalOutput}
            canRun={canRun}
            onRun={run}
            error={error}
          />
        </div>

        <ConfigPanel node={selectedNode} onChangeConfig={patchNodeConfig} />
      </div>
    </div>
  );
}
