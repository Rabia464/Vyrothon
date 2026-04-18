import type { CipherModule } from './types';

function readShift(config: Record<string, unknown>): number {
  const n = Number(config.shift ?? 3);
  if (!Number.isFinite(n)) return 3;
  return Math.round(n);
}

function normalizeShift(shift: number): number {
  return ((shift % 26) + 26) % 26;
}

function rotateLetter(code: number, delta: number): number {
  if (code >= 65 && code <= 90) {
    return ((code - 65 + delta + 26_000) % 26) + 65;
  }
  if (code >= 97 && code <= 122) {
    return ((code - 97 + delta + 26_000) % 26) + 97;
  }
  return code;
}

function transform(text: string, shift: number): string {
  const s = normalizeShift(shift);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)!;
    out += String.fromCharCode(rotateLetter(c, s));
  }
  return out;
}

export const caesarCipher: CipherModule = {
  name: 'Caesar Cipher',
  encrypt(text, config) {
    return transform(text, readShift(config));
  },
  decrypt(text, config) {
    return transform(text, -readShift(config));
  },
  configSchema: [
    {
      key: 'shift',
      label: 'Shift',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 25,
    },
  ],
};
