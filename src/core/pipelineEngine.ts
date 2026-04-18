import { cipherRegistry, isCipherType, type CipherType } from './cipherRegistry';

export interface PipelineEngineNode {
  type: string;
  config: Record<string, unknown>;
}

export interface PipelineEngineStep {
  nodeIndex: number;
  input: string;
  output: string;
}

export interface PipelineEngineResult {
  finalOutput: string;
  steps: PipelineEngineStep[];
}

export type PipelineEngineMode = 'encrypt' | 'decrypt';

/**
 * Runs a cascade: encrypt left→right, decrypt right→left with each cipher's `decrypt`.
 */
export function runPipeline(
  nodes: PipelineEngineNode[],
  input: string,
  mode: PipelineEngineMode,
): PipelineEngineResult {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error('Pipeline requires a non-empty `nodes` array.');
  }

  const steps: PipelineEngineStep[] = [];
  let current = input;

  if (mode === 'encrypt') {
    for (let i = 0; i < nodes.length; i++) {
      const { type, config } = nodes[i]!;
      const cipher = resolveCipher(type);
      const stepInput = current;
      const stepOutput = cipher.encrypt(stepInput, config);
      steps.push({ nodeIndex: i, input: stepInput, output: stepOutput });
      current = stepOutput;
    }
    return { finalOutput: current, steps };
  }

  if (mode === 'decrypt') {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const { type, config } = nodes[i]!;
      const cipher = resolveCipher(type);
      const stepInput = current;
      const stepOutput = cipher.decrypt(stepInput, config);
      steps.push({ nodeIndex: i, input: stepInput, output: stepOutput });
      current = stepOutput;
    }
    return { finalOutput: current, steps };
  }

  throw new Error(`Invalid mode "${String(mode)}". Use "encrypt" or "decrypt".`);
}

function resolveCipher(type: string) {
  if (!isCipherType(type)) {
    throw new Error(`Unknown cipher type "${type}". Expected one of: caesar, xor, vigenere.`);
  }
  return cipherRegistry[type as CipherType];
}

// ---------------------------------------------------------------------------
// Self-test (dev only): encrypt → decrypt round-trip
// ---------------------------------------------------------------------------

function runPipelineSelfTest(): void {
  const nodes: PipelineEngineNode[] = [
    { type: 'caesar', config: { shift: 3 } },
    { type: 'xor', config: { key: 'abc' } },
    { type: 'vigenere', config: { keyword: 'key' } },
  ];

  const plain = 'hello';
  const enc = runPipeline(nodes, plain, 'encrypt');
  const dec = runPipeline(nodes, enc.finalOutput, 'decrypt');

  const ok = dec.finalOutput === plain;
  // eslint-disable-next-line no-console -- intentional engine verification log
  console.log('[CipherStack pipelineEngine] self-test');
  // eslint-disable-next-line no-console
  console.log('  plain:', JSON.stringify(plain));
  // eslint-disable-next-line no-console
  console.log('  encrypted:', JSON.stringify(enc.finalOutput));
  // eslint-disable-next-line no-console
  console.log('  decrypted:', JSON.stringify(dec.finalOutput));
  // eslint-disable-next-line no-console
  console.log('  round-trip OK:', ok);
  // eslint-disable-next-line no-console
  console.log('  steps (encrypt):', enc.steps);
  // eslint-disable-next-line no-console
  console.log('  steps (decrypt):', dec.steps);

  if (!ok) {
    throw new Error('[pipelineEngine] self-test failed: decrypt(encrypt(plain)) !== plain');
  }
}

if (import.meta.env.DEV) {
  runPipelineSelfTest();
}
