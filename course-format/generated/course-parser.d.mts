export type ParseOptions = {
  grammarSource?: string;
};

export function parse(source: string, options?: ParseOptions): unknown;
