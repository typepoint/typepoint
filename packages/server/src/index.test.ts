import { partialOf } from 'jest-helpers';
import { defineEndpoint, Empty, EndpointDefinition } from '@typepoint/shared';
import { Todo } from '@typepoint/fixtures';
import {
  createHandler, EndpointContext, Request, Response, notFoundMiddleware, EndpointMiddleware, defineMiddleware,
} from './index';

describe('server', () => {
  describe('createHandler', () => {
    let getTodos: EndpointDefinition<Empty, Empty, Todo[]>;
    let todos: Todo[];

    beforeEach(() => {
      getTodos = defineEndpoint<Empty, Empty, Todo[]>((path) => path.literal('todos'));
      todos = [{
        id: '1',
        title: 'Write todo app',
        isCompleted: false,
      }];
    });

    it('should define an anonymous handler', () => {
      const getTodosHandler = createHandler(getTodos, (context) => {
        context.response.body = todos;
      });
      expect(getTodosHandler.name).toBe('AnonymousEndpointHandler');
    });

    it('should define a named handler', () => {
      const name = 'getTodosHandler';
      const getTodosHandler = createHandler(getTodos, (context) => {
        context.response.body = todos;
      }, name);
      expect(getTodosHandler.name).toBe(name);
    });

    it('should define an handler that can parse matching requests', async () => {
      const getTodosHandler = createHandler(getTodos, (context) => {
        context.response.body = todos;
      });

      const request = partialOf<Request<any, any>>({
        method: 'GET',
        url: '/todos',
        params: {
        },
      });
      const match = getTodosHandler.match(request);

      expect(match).toEqual({
        prePath: '',
        path: '/todos',
        postPath: '',
        params: {},
      });
    });

    it('should define an handler that will not parse non-matching requests', async () => {
      const getTodosHandler = createHandler(getTodos, (context) => {
        context.response.body = todos;
      });

      const request = partialOf<Request<any, any>>({
        method: 'POST',
        url: '/todos',
        params: {
        },
      });

      const match = getTodosHandler.match(request);

      expect(match).toBe(undefined);
    });

    it('should define a handler that can handle requests', async () => {
      const getTodosHandler = createHandler(getTodos, (ctx) => {
        ctx.response.body = todos;
      });

      const context = partialOf<EndpointContext<any, any, any>>({
        response: partialOf<Response<any>>({
          body: undefined,
        }),
      });

      await getTodosHandler.handle(context, () => Promise.resolve());

      expect(context).toHaveProperty(['response', 'body'], todos);
    });
  });

  describe('notFoundMiddleware', () => {
    let middleware: EndpointMiddleware;
    let context: EndpointContext<any, any, any>;

    beforeEach(() => {
      middleware = notFoundMiddleware();
      context = partialOf<EndpointContext<any, any, any>>({
        response: partialOf<Response<any>>({
          statusCode: undefined,
        }),
      });
    });

    it('should respond with 404 if request was not handled', async () => {
      const next = async () => { };
      await middleware.handle(context, next);
      expect(context.response.statusCode).toBe(404);
    });

    it('should not respond with 404 if request was handled', async () => {
      const next = async () => {
        context.response.statusCode = 204;
      };
      await middleware.handle(context, next);
      expect(context.response.statusCode).toBe(204);
    });
  });

  describe('defineMiddleware', () => {
    describe('when called with a name', () => {
      const someMiddleware = defineMiddleware(async () => { }, 'SomeMiddleware');
      expect(someMiddleware).toHaveProperty('name', 'SomeMiddleware');
    });

    describe('when called without a name', () => {
      const anonymousMiddleware = defineMiddleware(async () => { });
      expect(anonymousMiddleware).toHaveProperty('name', 'AnonymousEndpointMiddleware');
    });

    describe('when called', () => {
      let log: string;
      let someMiddleware: EndpointMiddleware;
      let context: EndpointContext<any, any, any>;

      const addToLog = (text: string) => {
        log += `${text}\n`;
      };

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      beforeEach(() => {
        log = '';
        someMiddleware = defineMiddleware(async (_context, next) => {
          addToLog('Middleware started');
          await next();
          addToLog('Middleware finished');
        });
      });

      it('should return an endpoint middleware', () => {
        expect(someMiddleware.handle).toBeInstanceOf(Function);
        expect(someMiddleware).toHaveProperty('name', 'AnonymousEndpointMiddleware');
      });

      describe('and running middleware', () => {
        beforeEach(async () => {
          context = partialOf<EndpointContext<any, any, any>>({});
          const next = jest.fn().mockImplementation(async () => {
            addToLog('Handler started');
            await delay(100);
            addToLog('Handler finished');
          });
          addToLog('Before calling middleware');
          await someMiddleware.handle(context, next);
          addToLog('After calling middleware');
        });

        it('should wait until handler function has finished', () => {
          expect(log).toBe(
            'Before calling middleware\n'
            + 'Middleware started\n'
            + 'Handler started\n'
            + 'Handler finished\n'
            + 'Middleware finished\n'
            + 'After calling middleware\n',
          );
        });
      });
    });
  });
});
