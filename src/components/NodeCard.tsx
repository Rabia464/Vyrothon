import { useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CipherFlowNode } from './flow/buildFlowElements';
import './NodeCard.css';

function MiniField({
  fieldKey,
  label,
  type,
  value,
  min,
  max,
  placeholder,
  onChange,
}: {
  fieldKey: string;
  label: string;
  type: 'number' | 'string';
  value: unknown;
  min?: number;
  max?: number;
  placeholder?: string;
  onChange: (key: string, v: string | number) => void;
}) {
  if (type === 'number') {
    const n = typeof value === 'number' ? value : Number(value);
    return (
      <label className="ncField">
        <span className="ncFieldLabel">{label}</span>
        <input
          className="ncInput mono"
          type="number"
          min={min}
          max={max}
          value={Number.isFinite(n) ? n : ''}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            onChange(fieldKey, Number.isFinite(v) ? v : 0);
          }}
        />
      </label>
    );
  }
  return (
    <label className="ncField">
      <span className="ncFieldLabel">{label}</span>
      <input
        className="ncInput mono"
        type="text"
        placeholder={placeholder}
        value={typeof value === 'string' ? value : String(value ?? '')}
        onChange={(e) => onChange(fieldKey, e.target.value)}
      />
    </label>
  );
}

export function NodeCard({ data, selected }: NodeProps<CipherFlowNode>) {
  const {
    cipherName,
    config,
    input,
    output,
    configSchema,
    index,
    total,
    onPatchConfig,
    onRemove,
    onMoveUp,
    onMoveDown,
  } = data;

  const patch = useCallback(
    (key: string, v: string | number) => {
      onPatchConfig({ [key]: v });
    },
    [onPatchConfig],
  );

  return (
    <div className={`ncRoot ${selected ? 'ncRootSelected' : ''}`}>
      <Handle className="ncHandle" type="target" position={Position.Left} isConnectable={false} />
      <Handle className="ncHandle" type="source" position={Position.Right} isConnectable={false} />

      <header className="ncHeader">
        <span className="ncBadge mono">#{index + 1}</span>
        <span className="ncTitle">{cipherName}</span>
      </header>

      <div className="ncCfg">
        {configSchema.map((f) => (
          <MiniField
            key={f.key}
            fieldKey={f.key}
            label={f.label}
            type={f.type}
            min={f.min}
            max={f.max}
            placeholder={f.placeholder}
            value={config[f.key]}
            onChange={patch}
          />
        ))}
      </div>

      <div className="ncIO">
        <div>
          <div className="ncIOLabel">Input</div>
          <pre className="ncIOBox mono">{input}</pre>
        </div>
        <div>
          <div className="ncIOLabel">Output</div>
          <pre className="ncIOBox mono">{output}</pre>
        </div>
      </div>

      <div className="ncToolbar">
        <button type="button" className="ncBtn" disabled={index <= 0} onClick={onMoveUp} title="Move earlier">
          ↑
        </button>
        <button
          type="button"
          className="ncBtn"
          disabled={index >= total - 1}
          onClick={onMoveDown}
          title="Move later"
        >
          ↓
        </button>
        <button type="button" className="ncBtn ncBtnDanger" onClick={onRemove} title="Remove node">
          Remove
        </button>
      </div>
    </div>
  );
}
