import * as express from 'express';
import {
  Router,
  EndpointMiddleware,
  EndpointContext,
  defineMiddleware,
} from '@typepoint/server';
import { partialOf } from 'jest-helpers';
import { Logger } from '@typepoint/shared';
import { toMiddleware } from '.';

class TestLogger implements Logger {
  private innerLog = '';

  private addToLog(...args: any[]): void {
    this.innerLog += `${args.map((arg) => `${arg}`).join(' ')}\n`;
  }

  log(...args: any[]): void {
    this.addToLog(...args);
  }

  debug(...args: any[]): void {
    this.addToLog('DEBUG', ...args);
  }

  info(...args: any[]): void {
    this.addToLog('INFO', ...args);
  }

  warn(...args: any[]): void {
    this.addToLog('WARN', ...args);
  }

  error(...args: any[]): void {
    this.addToLog('ERROR', ...args);
  }

  toString() {
    return this.innerLog;
  }
}

describe('server/express', () => {
  describe('toMiddleware', () => {
    let logger: TestLogger;

    const delay = (durationInMs: number) => new Promise((resolve, reject) => {
      logger.debug(`Waiting ${durationInMs}ms`);
      setTimeout(() => {
        logger.debug('Wait over');
        resolve();
      }, durationInMs);
    });

    describe('with 2 middleware and no handlers', () => {
      let middlewares: EndpointMiddleware[];
      let router: Router;
      let expressMiddleware: express.Handler;

      beforeEach(() => {
        const middlewareDelayInMs = 100;

        const Middleware1 = defineMiddleware((context, next) => delay(middlewareDelayInMs)
          .then(() => logger.debug('Before next()'))
          .then(() => next())
          .then(() => logger.debug('After next()')), 'Middleware1');

        const Middleware2 = defineMiddleware((context, next) => delay(middlewareDelayInMs)
          .then(() => logger.debug('Before next()'))
          .then(() => next())
          .then(() => logger.debug('After next()')), 'Middleware2');

        middlewares = [
          new Middleware1(),
          new Middleware2(),
        ];

        router = partialOf<Router>({
          getMiddlewares: jest.fn().mockReturnValue(middlewares),
          getHandlers: jest.fn().mockReturnValue([]),
        });

        logger = new TestLogger();

        expressMiddleware = toMiddleware(router, { logger });
      });

      it('should return a function', () => {
        expect(expressMiddleware).toBeInstanceOf(Function);
      });

      describe('when called', () => {
        let req: express.Request;
        let res: express.Response;
        let next: () => void;

        beforeEach(async () => new Promise((resolve) => {
          req = partialOf<express.Request>({
            method: 'GET',
            url: 'https://www.example.com/todos',
          });
          res = partialOf<express.Response>({
            end: () => resolve(),
          });
          next = () => resolve();

          expressMiddleware(req, res, next);
        }));

        it('should call each middleware in order', () => {
          const expectedLog = 'DEBUG Executing middleware: Middleware1\n'
            + 'DEBUG Waiting 100ms\n'
            + 'DEBUG Wait over\n'
            + 'DEBUG Before next()\n'
            + 'DEBUG Executing middleware: Middleware2\n'
            + 'DEBUG Waiting 100ms\n'
            + 'DEBUG Wait over\n'
            + 'DEBUG Before next()\n'
            + 'DEBUG After next()\n'
            + 'DEBUG After next()\n';
          expect(logger.toString()).toBe(expectedLog);
        });
      });
    });
  });
});
