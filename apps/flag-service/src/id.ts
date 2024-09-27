import { customAlphabet } from 'nanoid';
import { z } from 'zod';

const prefixes = {
  feature: 'ftr',
  featureState: 'fst',
} as const;

type Prefix = (typeof prefixes)[keyof typeof prefixes];
export type Entity = keyof typeof prefixes;

type PrefixToId = {
  [K in keyof typeof prefixes]: `${(typeof prefixes)[K]}${string}`;
};

// Zod schemas
const createIdSchema = <T extends Prefix>(prefix: T) =>
  z.custom<`${T}${string}`>(
    (val): val is `${T}${string}` =>
      typeof val === 'string' && val.startsWith(prefix),
  );

export const FeatureId = createIdSchema(prefixes.feature);
export const FeatureStateId = createIdSchema(prefixes.featureState);

export type FeatureId = z.infer<typeof FeatureId>;
export type FeatureStateId = z.infer<typeof FeatureStateId>;

interface GenerateIdOptions {
  /**
   * The length of the generated ID.
   * @default 12
   * @example 12 => "abc123def456"
   * */
  length?: number;
  /**
   * The separator to use between the prefix and the generated ID.
   * @default "_"
   * @example "_" => "str_abc123"
   * */
  separator?: string;
}

/**
 * Generates a unique ID with a given prefix.
 * @param prefix The prefix to use for the generated ID.
 * @param options The options for generating the ID.
 * @example
 * generateId("task") => "tsk_abc123def456"
 * generateId("user", { length: 8 }) => "usr_abc123d"
 * generateId("customer", { separator: "-" }) => "cst-abc123def456"
 */
export function generateId<T extends keyof typeof prefixes>(
  prefix: T,
  { length = 12, separator = '_' }: GenerateIdOptions = {},
): PrefixToId[T] {
  const id = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    length,
  )();
  return `${prefixes[prefix]}${separator}${id}` as PrefixToId[T];
}
