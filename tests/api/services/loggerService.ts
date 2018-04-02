import { injectable } from 'inversify';

@injectable()
export class LoggerService {
  info(...args: any[]) {
    // tslint:disable-next-line:no-console
    console.info(...args);
  }

  warn(...args: any[]) {
    // tslint:disable-next-line:no-console
    console.warn(...args);
  }

  error(...args: any[]) {
    // tslint:disable-next-line:no-console
    console.error(...args);
  }
}
