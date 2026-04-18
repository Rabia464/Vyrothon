import type { PipelineMode } from '@/core/types';
import { MIN_PIPELINE_NODES } from '@/core/types';
import './IoPanel.css';

interface IoPanelProps {
  input: string;
  onInputChange: (next: string) => void;
  mode: PipelineMode;
  onModeChange: (mode: PipelineMode) => void;
  finalOutput: string;
  canRun: boolean;
  onRun: () => void;
  error: string | null;
}

export function IoPanel({
  input,
  onInputChange,
  mode,
  onModeChange,
  finalOutput,
  canRun,
  onRun,
  error,
}: IoPanelProps) {
  return (
    <section className="ioPanel panel">
      <header className="panelHeader">
        <h2 className="panelTitle">Input / output</h2>
      </header>
      <div className="panelBody">
        <div className="toolbar">
          <div className="pillToggle" role="group" aria-label="Pipeline mode">
            <button type="button" aria-pressed={mode === 'encrypt'} onClick={() => onModeChange('encrypt')}>
              Encrypt
            </button>
            <button type="button" aria-pressed={mode === 'decrypt'} onClick={() => onModeChange('decrypt')}>
              Decrypt
            </button>
          </div>

          <button type="button" className="btn btnPrimary" disabled={!canRun} onClick={onRun}>
            Run pipeline
          </button>
        </div>

        <p className="hint">
          Decrypt automatically reverses node order. Minimum <span className="mono">{MIN_PIPELINE_NODES}</span> nodes
          required.
        </p>

        <label className="fieldLabel" htmlFor="pipeline-input">
          Input text
        </label>
        <textarea
          id="pipeline-input"
          className="textarea mono"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          spellCheck={false}
        />

        <label className="fieldLabel" htmlFor="pipeline-output">
          Final output
        </label>
        <textarea id="pipeline-output" className="textarea mono" value={finalOutput} readOnly spellCheck={false} />

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
