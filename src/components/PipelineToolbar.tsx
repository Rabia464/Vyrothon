import { useState } from 'react';
import { CIPHER_TYPES, type CipherType } from '@/core/cipherRegistry';
import './PipelineToolbar.css';

interface PipelineToolbarProps {
  onAdd: (type: CipherType) => void;
}

const labels: Record<CipherType, string> = {
  caesar: 'Caesar',
  xor: 'XOR',
  vigenere: 'Vigenère',
};

export function PipelineToolbar({ onAdd }: PipelineToolbarProps) {
  const [choice, setChoice] = useState<CipherType>('caesar');

  return (
    <div className="pipelineToolbar panel">
      <header className="panelHeader">
        <h2 className="panelTitle">Add step</h2>
      </header>
      <div className="panelBody pipelineToolbarBody">
        <label className="fieldLabel" htmlFor="add-cipher-select">
          Cipher
        </label>
        <div className="pipelineToolbarRow">
          <select
            id="add-cipher-select"
            className="pipelineSelect"
            value={choice}
            onChange={(e) => setChoice(e.target.value as CipherType)}
          >
            {CIPHER_TYPES.map((t) => (
              <option key={t} value={t}>
                {labels[t]}
              </option>
            ))}
          </select>
          <button type="button" className="btn btnPrimary" onClick={() => onAdd(choice)}>
            Add node
          </button>
        </div>
        <p className="pipelineToolbarHint">Flow is left → right. Need at least three nodes to run.</p>
      </div>
    </div>
  );
}
