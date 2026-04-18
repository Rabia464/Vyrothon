import { getCipherById } from '@/ciphers';
import type { PipelineNode } from '@/core/types';
import type { ConfigFieldSchema } from '@/ciphers/types';
import './ConfigPanel.css';

interface ConfigPanelProps {
  node: PipelineNode | null;
  onChangeConfig: (nodeId: string, patch: Record<string, unknown>) => void;
}

function Field({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: ConfigFieldSchema;
  value: unknown;
  onChange: (key: string, next: string | number) => void;
}) {
  if (field.type === 'number') {
    const n = typeof value === 'number' ? value : Number(value);
    return (
      <input
        id={id}
        className="cfgInput"
        type="number"
        min={field.min}
        max={field.max}
        value={Number.isFinite(n) ? n : ''}
        onChange={(e) => {
          const v = e.target.valueAsNumber;
          onChange(field.key, Number.isFinite(v) ? v : Number(field.defaultValue));
        }}
      />
    );
  }

  return (
    <input
      id={id}
      className="cfgInput"
      type="text"
      placeholder={field.placeholder}
      value={typeof value === 'string' ? value : String(value ?? '')}
      onChange={(e) => onChange(field.key, e.target.value)}
    />
  );
}

export function ConfigPanel({ node, onChangeConfig }: ConfigPanelProps) {
  if (!node) {
    return (
      <aside className="configPanel panel">
        <header className="panelHeader">
          <h2 className="panelTitle">Config</h2>
        </header>
        <div className="panelBody">
          <p className="muted">Select a pipeline node to edit its cipher parameters.</p>
        </div>
      </aside>
    );
  }

  const cipher = getCipherById(node.type);
  if (!cipher) {
    return (
      <aside className="configPanel panel">
        <header className="panelHeader">
          <h2 className="panelTitle">Config</h2>
        </header>
        <div className="panelBody">
          <p className="muted">This node references an unknown cipher.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="configPanel panel">
      <header className="panelHeader">
        <h2 className="panelTitle">Config</h2>
      </header>
      <div className="panelBody">
        <div className="cfgCipherTitle">{cipher.name}</div>
        <p className="cfgCipherDesc">{cipher.description}</p>

        {cipher.configSchema.map((field) => (
          <div key={field.key}>
            <label className="fieldLabel" htmlFor={`${node.id}-${field.key}`}>
              {field.label}
            </label>
            <Field
              id={`${node.id}-${field.key}`}
              field={field}
              value={node.config[field.key]}
              onChange={(key, next) => {
                const patch: Record<string, unknown> = { [key]: next };
                onChangeConfig(node.id, patch);
              }}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
