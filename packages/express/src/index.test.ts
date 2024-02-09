/* eslint-disable max-classes-per-file */
import * as express from 'express';
import {
  createHandler,
  defineMiddleware,
  EndpointHandlerFunctionFromDefinition,
  EndpointHandler,
  Router,
  ValidateAndTransformFunction,
} from '@typepoint/server';
import { partialOf } from 'jest-helpers';
import {
  arrayOf,
  defineEndpoint,
  Empty,
  EndpointDefinition,
  Logger,
} from '@typepoint/shared';
import {
  getTodos,
  Todo,
} from '@typepoint/fixtures';
import {
  OK,
  UNAUTHORIZED,
  NOT_FOUND,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from 'http-status-codes';
import { mocked } from 'ts-jest/utils';
import { toMiddleware } from '.';
import { createContext, getLogger } from './utils';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

jest.mock('./utils', () => {
  const originalUtils = jest.requireActual('./utils');

  return {
    createContext: jest.fn().mockImplementation(originalUtils.createContext),
    getLogger: jest.fn().mockImplementation(originalUtils.getLogger),
    trySendInternalServerError: jest.fn().mockImplementation(originalUtils.trySendInternalServerError),
  };
});

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
    class LoginRequestBody {
      username?: string;

      password?: string;
    }

    let logger: TestLogger;
    let router: Router;
    let expressMiddleware: express.Handler;
    let validateAndTransform: ValidateAndTransformFunction;
    let loginHandlerFn: EndpointHandlerFunctionFromDefinition<EndpointDefinition<Empty, LoginRequestBody, Empty>>;
    let getTodosHandler: EndpointHandler;

    const delay = (durationInMs: number) => new Promise<void>((resolve) => {
      logger.debug(`Waiting ${durationInMs}ms`);
      setTimeout(() => {
        logger.debug('Wait over');
        resolve();
      }, durationInMs);
    });

    beforeEach(() => {
      logger = new TestLogger();

      jest.spyOn(console, 'warn').mockImplementation(noop);

      const middlewareDelayInMs = 100;

      const middleware1 = defineMiddleware(async (_context, next) => {
        await delay(middlewareDelayInMs);
        logger.debug('Before next()');
        await next();
        logger.debug('After next()');
      }, 'Middleware1');

      const middleware2 = defineMiddleware(async (_context, next) => {
        await delay(middlewareDelayInMs);
        logger.debug('Before next()');
        await next();
        logger.debug('After next()');
      }, 'Middleware2');

      const loginEndpoint = defineEndpoint({
        requestParams: Empty,
        requestBody: LoginRequestBody,
        responseBody: Empty,
        path: (path) => path.literal('api/auth/login'),
      });

      loginHandlerFn = jest.fn().mockImplementation((context: Parameters<typeof loginHandlerFn>[0]) => {
        if (context.endpoint !== loginEndpoint) {
          throw new Error('Unexpected endpoint in context');
        }

        const { request: { body: { username, password } }, response } = context;
        if (username === 'hugh' && password === 'swordfish') {
          response.statusCode = OK;
        } else {
          response.statusCode = UNAUTHORIZED;
        }
      });

      const loginHandler = createHandler(loginEndpoint, loginHandlerFn, 'loginHandler');

      const getTodosEndpoint = defineEndpoint({
        path: (path) => path.literal('api/todos'),
        requestParams: Empty,
        requestBody: Empty,
        responseBody: arrayOf(Todo),
      });

      getTodosHandler = createHandler(getTodosEndpoint, (context) => {
        if (context.endpoint !== getTodosEndpoint) {
          throw new Error('Unexpected endpoint in context');
        }
        context.response.body = getTodos();
      }, 'getTodosHandler');

      class GetTodoRequestParams {
        id!: string;
      }

      const getTodoEndpoint = defineEndpoint({
        path: (path) => path.literal('api/todos').param('id'),
        requestParams: GetTodoRequestParams,
        requestBody: Empty,
        responseBody: Todo,
      });

      const getTodoHandler = createHandler(getTodoEndpoint, (context) => {
        if (context.endpoint !== getTodoEndpoint) {
          throw new Error('Unexpected endpoint in context');
        }

        const { id } = context.request.params;
        const todo = getTodos().find((t) => t.id === id);
        if (!todo) {
          logger.info(`Todo with id "${context.request.params.id}" not found`);
          context.response.statusCode = NOT_FOUND;
          return;
        }
        logger.info(`Returning Todo with id "${id}"`);
        context.response.body = todo;
      }, 'getTodoHandler');

      validateAndTransform = jest.fn().mockImplementation((value) => ({ value }));

      router = partialOf<Router>({
        middlewares: [middleware1, middleware2],
        handlers: [
          loginHandler,
          getTodoHandler,
          getTodosHandler,
        ],
        validateAndTransform,
      });

      expressMiddleware = toMiddleware(router, { logger });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return a function', () => {
      expect(expressMiddleware).toBeInstanceOf(Function);
    });

    describe('when called', () => {
      let req: express.Request;
      let res: express.Response;

      beforeEach(() => {
        req = partialOf<express.Request>({
          method: 'GET',
          url: 'https://www.example.com/api/auth/login',
          params: {},
          body: {},
        });
        res = partialOf<express.Response>({
          json: jest.fn(),
          end: noop,
        });
      });

      const runExpressMiddlewareAsync = async (next = noop) => {
        await new Promise<void>((resolve) => {
          res.end = () => resolve();
          expressMiddleware(req, res, () => {
            next();
            resolve();
          });
        });
      };

      it('should call each middleware and handler in order', async () => {
        await runExpressMiddlewareAsync();

        const expectedLog = 'DEBUG Executing middleware: Middleware1\n'
            + 'DEBUG Waiting 100ms\n'
            + 'DEBUG Wait over\n'
            + 'DEBUG Before next()\n'
            + 'DEBUG Executing middleware: Middleware2\n'
            + 'DEBUG Waiting 100ms\n'
            + 'DEBUG Wait over\n'
            + 'DEBUG Before next()\n'
            + 'DEBUG Executing handler: loginHandler\n'
            + 'DEBUG Executed handler: loginHandler\n'
            + 'DEBUG After next()\n'
            + 'DEBUG Executed middleware: Middleware2\n'
            + 'DEBUG After next()\n'
            + 'DEBUG Executed middleware: Middleware1\n';
        expect(logger.toString()).toBe(expectedLog);
      });

      it('should return status code from handler', async () => {
        req.body = {
          username: 'hugh',
          password: 'incorrect password',
        };
        await runExpressMiddlewareAsync();
        expect(res.statusCode).toBe(UNAUTHORIZED);
      });

      it('should respond with BAD_REQUEST if request body is invalid', async () => {
        mocked(validateAndTransform)
          .mockImplementationOnce((value) => ({ value }))
          .mockImplementationOnce(() => ({
            validationError: {
              message: 'username and password are required',
            },
          }));
        await runExpressMiddlewareAsync();
        expect(res.statusCode).toBe(BAD_REQUEST);
      });

      it('should response with BAD_REQUEST if request params are invalid', async () => {
        mocked(validateAndTransform)
          .mockImplementationOnce(() => ({
            validationError: {
              message: 'invalid params',
            },
          }));
        await runExpressMiddlewareAsync();
        expect(res.statusCode).toBe(BAD_REQUEST);
      });

      it('should response with INTERNAL_SERVER_ERROR if middleware or handler errors', async () => {
        mocked(loginHandlerFn).mockImplementation(async () => {
          throw new Error('Division by zero');
        });
        await runExpressMiddlewareAsync();
        expect(res.statusCode).toBe(INTERNAL_SERVER_ERROR);
      });

      it('should response with INTERNAL_SERVER_ERROR if it fails to create context', async () => {
        mocked(createContext).mockImplementationOnce(() => {
          throw new Error('Boom! Unexpected logic error');
        });
        await runExpressMiddlewareAsync();
        expect(res.statusCode).toBe(INTERNAL_SERVER_ERROR);
        expect(logger.toString()).toBe('ERROR Error constructing context:  Error: Boom! Unexpected logic error\n');
      });

      it('should call the next express handler/middleware when request not handled', async () => {
        expect(res.statusCode).toBe(undefined);
        const next = jest.fn();
        req.url = 'https://www.example.com/api/auth/unknownEndpoint';
        await runExpressMiddlewareAsync(next);
        expect(res.statusCode).toBe(undefined);
        expect(next).toHaveBeenCalledWith();
      });

      it('should not log handler name if it does not have one', async () => {
        const expectedLog = 'DEBUG Executing middleware: Middleware1\n'
          + 'DEBUG Waiting 100ms\n'
          + 'DEBUG Wait over\n'
          + 'DEBUG Before next()\n'
          + 'DEBUG Executing middleware: Middleware2\n'
          + 'DEBUG Waiting 100ms\n'
          + 'DEBUG Wait over\n'
          + 'DEBUG Before next()\n'
          + 'DEBUG After next()\n'
          + 'DEBUG Executed middleware: Middleware2\n'
          + 'DEBUG After next()\n'
          + 'DEBUG Executed middleware: Middleware1\n';
        getTodosHandler.name = '';
        const next = jest.fn();
        req.url = 'https://www.example.com/api/todos';
        await runExpressMiddlewareAsync(next);
        expect(logger.toString()).toEqual(expectedLog);
      });
    });
  });
});
