export interface Logger {
  log(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };

export class NoopLogger {
  log = noop;

  debug = noop;

  info = noop;

  warn = noop;

  error = noop;
}
