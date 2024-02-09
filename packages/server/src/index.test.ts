import { partialOf, deepPartialOf } from 'jest-helpers';
import { defineEndpoint, Empty, EndpointDefinition } from '@typepoint/shared';
import { Todo } from '@typepoint/fixtures';
import { assert, Equal, Not } from 'type-assertions';
import { EndpointHandlerFunctionFromDefinition } from './types';
import {
  addHeadersMiddleware,
  createHandler,
  defineMiddleware,
  EndpointContext,
  EndpointMiddleware,
  HeadersAlreadySent,
  notFoundMiddleware,
  Request,
  Response,
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

    it('should define a handler that can handle requests with endpoint using [Type] array syntax', async () => {
      const getTodosV2 = defineEndpoint({
        path: (path) => path.literal('api/todos'),
        requestParams: Empty,
        requestBody: Empty,
        responseBody: [Todo],
      });
      const getTodosHandler = createHandler(getTodosV2, async (ctx) => {
        ctx.response.body = todos;
      });

      const context = partialOf<EndpointContext<any, any, any>>({
        response: partialOf<Response<any>>({
          body: undefined,
        }),
      });

      await getTodosHandler.handle(context, () => Promise.resolve());

      expect(context).toHaveProperty(['response', 'body'], todos);

      type GetTodosHandleFunction = EndpointHandlerFunctionFromDefinition<typeof getTodosV2>;
      type ContextType = Parameters<GetTodosHandleFunction>[0];
      type Next = Parameters<GetTodosHandleFunction>[1];

      assert<Equal<ContextType, EndpointContext<Empty, Empty, Todo[]>>>();
      assert<Not<Equal<ContextType, EndpointContext<Empty, Empty, [Todo]>>>>();

      type ExpectedNext = () => Promise<void>;
      assert<Equal<Next, ExpectedNext>>();
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
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('warns that it is deprecated', () => {
      defineMiddleware(async () => {});
      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenLastCalledWith(
        'defineMiddleware is deprecated and will be removed in a future release. Use createMiddleware instead.',
      );
    });

    it('should have a name when specified', () => {
      const someMiddleware = defineMiddleware(async () => { }, 'SomeMiddleware');
      expect(someMiddleware).toHaveProperty('name', 'SomeMiddleware');
    });

    it('should have a default name when none provided', () => {
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

      const delay = (ms: number) => new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

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

  describe('addHeadersMiddleware', () => {
    it('should create middleware that automatically adds the given headers', async () => {
      const middleware = addHeadersMiddleware({
        Authorization: 'Basic Secret',
      });

      expect(middleware.name).toBe('AddHeadersMiddleware');

      const context = deepPartialOf<EndpointContext<any, any, any>>({
        response: {
          header: jest.fn(),
        },
      });
      const next = jest.fn();
      await middleware.handle(context, next);

      expect(context.response.header).toHaveBeenCalledWith('Authorization', 'Basic Secret');
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('HeadersAlreadySent', () => {
    it('should create an error object', () => {
      expect(new HeadersAlreadySent()).toHaveProperty('message', 'Headers have already been sent');
      expect(new HeadersAlreadySent('Can not redirect'))
        .toHaveProperty('message', 'Can not redirect - Headers have already been sent');
    });
  });
});
