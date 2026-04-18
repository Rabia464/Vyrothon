import type { CipherModule } from './types';

function readKeyword(config: Record<string, unknown>): string {
  return String(config.keyword ?? 'KEY');
}

function onlyLettersKeyword(keyword: string): string {
  return keyword.replace(/[^A-Za-z]/g, '').toUpperCase();
}

function letterIndex(c: string): number {
  return c.toUpperCase().charCodeAt(0)! - 65;
}

function isUpper(code: number): boolean {
  return code >= 65 && code <= 90;
}

function isLower(code: number): boolean {
  return code >= 97 && code <= 122;
}

function transform(text: string, keyword: string, sign: 1 | -1): string {
  const key = onlyLettersKeyword(keyword);
  if (key.length === 0) {
    throw new Error('Vigenère keyword must contain at least one letter');
  }

  let ki = 0;
  let out = '';

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)!;

    if (isUpper(code)) {
      const shift = letterIndex(key[ki % key.length]!);
      ki++;
      const base = 65;
      const x = code - base;
      const y = (x + sign * shift + 26_000) % 26;
      out += String.fromCharCode(base + y);
      continue;
    }

    if (isLower(code)) {
      const shift = letterIndex(key[ki % key.length]!);
      ki++;
      const base = 97;
      const x = code - base;
      const y = (x + sign * shift + 26_000) % 26;
      out += String.fromCharCode(base + y);
      continue;
    }

    out += text[i]!;
  }

  return out;
}

export const vigenereCipher: CipherModule = {
  name: 'Vigenère Cipher',
  encrypt(text, config) {
    return transform(text, readKeyword(config), 1);
  },
  decrypt(text, config) {
    return transform(text, readKeyword(config), -1);
  },
  configSchema: [
    {
      key: 'keyword',
      label: 'Keyword',
      type: 'string',
      defaultValue: 'KEY',
      placeholder: 'At least one letter',
    },
  ],
};
