export type ConfigFieldType = 'number' | 'string';

export interface ConfigFieldSchema {
  key: string;
  label: string;
  type: ConfigFieldType;
  defaultValue: string | number;
  min?: number;
  max?: number;
  placeholder?: string;
}

/** Plain cipher module (engine + registry). */
export interface CipherModule {
  name: string;
  encrypt(text: string, config: Record<string, unknown>): string;
  decrypt(text: string, config: Record<string, unknown>): string;
  configSchema: ConfigFieldSchema[];
}

/** UI-facing cipher (adds stable id + description + parseConfig). */
export interface CipherDefinition extends CipherModule {
  id: string;
  description: string;
  parseConfig(raw: Record<string, unknown>): Record<string, unknown>;
}
