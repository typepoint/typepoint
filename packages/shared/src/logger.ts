export interface Logger {
  log(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

const noop = () => { };

export class NoopLogger {
  log = noop;

  debug = noop;

  info = noop;

  warn = noop;

  error = noop;
}
