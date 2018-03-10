export interface BasicConsole {
  warn?: (...args: string[]) => void;
  log: (...args: string[]) => void;
}

export function warnIfWindowDetected(window: any, console: BasicConsole) {
  if (typeof window !== 'undefined') {
    const warn = (console.warn || console.log).bind(console);
    warn();
    warn('It appears you\'ve referenced \'strongpoint/server\' in your client side code (window detected)');
    warn();
  }
}
