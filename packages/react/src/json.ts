export const stringify = (value: any) => (value === undefined ? '' : JSON.stringify(value));

export const parse = (value: string) => (value ? JSON.parse(value) : undefined);
