import type { PipelineNode } from './types';

/** Returns a user-facing error message, or `null` if valid. */
export function validatePipelineNodes(nodes: PipelineNode[]): string | null {
  for (const n of nodes) {
    if (n.type === 'xor') {
      const k = String(n.config.key ?? '');
      if (!k.trim()) {
        return 'XOR nodes need a non-empty key. Select the node and set the key in the config panel.';
      }
    }
    if (n.type === 'vigenere') {
      const kw = String(n.config.keyword ?? '');
      if (!/[A-Za-z]/.test(kw)) {
        return 'Vigenère nodes need a keyword with at least one letter.';
      }
    }
  }
  return null;
}
