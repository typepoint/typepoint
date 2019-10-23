import { injectable } from 'inversify';

@injectable()
export class LoggerService {
  info = (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.info(...args);
  }

  warn = (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }

  error = (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
}
