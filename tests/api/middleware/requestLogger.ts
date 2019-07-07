import chalk from 'chalk';
import { injectable } from 'inversify';
import { EndpointContext, EndpointMiddleware } from '../../../src/server';
import { LoggerService } from '../services/loggerService';

@injectable()
export class RequestLoggerMiddleware extends EndpointMiddleware {
  constructor(private loggerService: LoggerService) {
    super();
    this.define(async (context, next) => {
      let error: any;
      try {
        await next();
      } catch (err) {
        error = err;
      } finally {
        const responseTime = context.response.header('x-response-time');
        const errorMessage = error ? chalk.red(` - ${ error.message || error }`) : '';
        this.loggerService.info(
          `${ context.request.method } ${ context.request.url } - ${ responseTime }${ errorMessage }`
        );
      }
    });
  }
}
