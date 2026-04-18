import { caesarCipher } from '@/ciphers/caesar';
import { xorCipher } from '@/ciphers/xor';
import { vigenereCipher } from '@/ciphers/vigenere';
import type { CipherModule } from '@/ciphers/types';

export const CIPHER_TYPES = ['caesar', 'xor', 'vigenere'] as const;
export type CipherType = (typeof CIPHER_TYPES)[number];

export function isCipherType(value: string): value is CipherType {
  return (CIPHER_TYPES as readonly string[]).includes(value);
}

/**
 * Registry of all built-in ciphers (keys match `PipelineEngineNode.type`).
 */
export const cipherRegistry: Record<CipherType, CipherModule> = {
  caesar: caesarCipher,
  xor: xorCipher,
  vigenere: vigenereCipher,
};
