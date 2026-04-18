import type { CipherModule } from './types';

function readKey(config: Record<string, unknown>): string {
  return String(config.key ?? '');
}

/** XOR on UTF-16 code units with a repeating key (symmetric: encrypt === decrypt). */
function xorApply(text: string, config: Record<string, unknown>): string {
  const key = readKey(config);
  if (key.length === 0) {
    throw new Error('XOR key must be a non-empty string');
  }
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const t = text.charCodeAt(i)!;
    const k = key.charCodeAt(i % key.length)!;
    out += String.fromCharCode(t ^ k);
  }
  return out;
}

export const xorCipher: CipherModule = {
  name: 'XOR Cipher',
  encrypt: xorApply,
  decrypt: xorApply,
  configSchema: [
    {
      key: 'key',
      label: 'Key',
      type: 'string',
      defaultValue: 'abc',
      placeholder: 'Non-empty string',
    },
  ],
};
