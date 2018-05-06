import { expect } from 'chai';
import * as sinon from 'sinon';

import { Todo } from '../tests/api/models/todo';
import partialMockOf from '../tests/infrastructure/mockOf';
import { defineHandler, EndpointContext, Request, Response, NotFoundMiddleware, EndpointMiddleware } from './server';
import { Empty, EndpointDefinition } from './shared';

describe('server', () => {
  describe('defineHandler', () => {
    let getTodos: EndpointDefinition<Empty, Empty, Todo[]>;
    let todos: Todo[];

    beforeEach(() => {
      getTodos = new EndpointDefinition<Empty, Empty, Todo[]>(path => path.literal('todos'));
      todos = [{
        id: '1',
        title: 'Write todo app',
        isCompleted: false
      }];
    });

    it('should define an anonymous handler class', () => {
      const GetTodosHandler = defineHandler(getTodos, context => {
        context.response.body = todos;
      });

      const getTodosHandler = new GetTodosHandler();
      expect(getTodosHandler.name).to.equal('AnonymousEndpointHandler');
    });

    it('should define a named handler class', () => {
      const name = 'getTodosHandler';
      const GetTodosHandler = defineHandler(getTodos, context => {
        context.response.body = todos;
      }, name);

      const handler = new GetTodosHandler();
      expect(handler.name).to.equal(name);
    });

    it('should define an handler class that can parse matching requests', async () => {
      const GetTodosHandler = defineHandler(getTodos, context => {
        context.response.body = todos;
      });

      const getTodosHandler = new GetTodosHandler();

      const request = partialMockOf<Request<any, any>>({
        method: 'GET',
        url: '/todos',
        params: {
        }
      });
      const match = getTodosHandler.match(request);

      expect(match).to.deep.equal({
        prePath: '',
        path: '/todos',
        postPath: '',
        params: {},
      });
    });

    it('should define an handler class that will not parse non-matching requests', async () => {
      const GetTodosHandler = defineHandler(getTodos, context => {
        context.response.body = todos;
      });

      const getTodosHandler = new GetTodosHandler();

      const request = partialMockOf<Request<any, any>>({
        method: 'POST',
        url: '/todos',
        params: {
        }
      });
      const match = getTodosHandler.match(request);

      expect(match).to.equal(undefined);
    });

    it('should define a handler class that can handle requests', async () => {
      const GetTodosHandler = defineHandler(getTodos, ctx => {
        ctx.response.body = todos;
      });

      const context = partialMockOf<EndpointContext<any, any, any>>({
        response: partialMockOf<Response<any>>({
          body: undefined
        })
      });
      const getTodosHandler = new GetTodosHandler();
      await getTodosHandler.handle(context, () => Promise.resolve());

      expect(context)
        .to.have.property('response')
        .to.have.property('body')
        .that.deep.equals(todos);
    });
  });

  describe('NotFoundMiddleware', () => {
    let middleware: EndpointMiddleware;
    let context: EndpointContext<any, any, any>;

    beforeEach(() => {
      middleware = new NotFoundMiddleware();
      context = partialMockOf<EndpointContext<any, any, any>>({
        response: partialMockOf<Response<any>>({
          statusCode: undefined
        })
      });
    });

    it('should respond with 404 if request was not handled', async () => {
      const next = async () => { };
      await middleware.handle(context, next);
      expect(context.response.statusCode).to.equal(404);
    });

    it('should not respond with 404 if request was handled', async () => {
      const next = async () => {
        context.response.statusCode = 204;
      };
      await middleware.handle(context, next);
      expect(context.response.statusCode).to.equal(204);
    });
  });
});
