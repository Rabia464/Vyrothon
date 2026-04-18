import { CIPHER_TYPES, cipherRegistry, type CipherType } from '@/core/cipherRegistry';
import type { CipherDefinition } from './types';

const descriptions: Record<CipherType, string> = {
  caesar: 'Rotates Latin letters (A–Z, a–z); other characters pass through unchanged.',
  xor: 'XOR each UTF-16 code unit with a repeating key (symmetric; same op for decrypt).',
  vigenere: 'Polyalphabetic substitution on Latin letters; non-letters are unchanged.',
};

function wrapCipher(id: CipherType): CipherDefinition {
  const mod = cipherRegistry[id];
  return {
    id,
    name: mod.name,
    description: descriptions[id],
    encrypt: mod.encrypt,
    decrypt: mod.decrypt,
    configSchema: mod.configSchema,
    parseConfig(raw: Record<string, unknown>): Record<string, unknown> {
      const out: Record<string, unknown> = {};
      for (const f of mod.configSchema) {
        out[f.key] = f.defaultValue;
      }
      for (const f of mod.configSchema) {
        if (raw[f.key] !== undefined) {
          out[f.key] = raw[f.key]!;
        }
      }
      return out;
    },
  };
}

const list: CipherDefinition[] = CIPHER_TYPES.map((id) => wrapCipher(id));

const byId = new Map<string, CipherDefinition>(list.map((c) => [c.id, c]));

export function getAllCiphers(): CipherDefinition[] {
  return [...list];
}

export function getCipherById(id: string): CipherDefinition | undefined {
  return byId.get(id);
}

export function assertCipher(id: string): CipherDefinition {
  const c = byId.get(id);
  if (!c) {
    throw new Error(`Unknown cipher id: ${id}`);
  }
  return c;
}

export function defaultConfigFor(cipher: CipherDefinition): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of cipher.configSchema) {
    out[field.key] = field.defaultValue;
  }
  return out;
}
