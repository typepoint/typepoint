import { expect } from 'chai';

import { defineHandler, EndpointContext, Response, Request } from '../../../src/server';
import { defineEndpoint, Empty } from '../../../src/shared';
import { Todo } from '../../fixtures/todos';
import partialMockOf from '../../infrastructure/mockOf';

describe('server', () => {
  describe('defineHandler', () => {
    const getTodos = defineEndpoint<Empty, Empty, Todo[]>('/todos');
    const todos: Todo[] = [{
      id: '1',
      title: 'Write todo app',
      isCompleted: false
    }];

    it('should define an anonymous handler class', () => {
      const GetTodosHandler = defineHandler(getTodos, context => {
        context.response.body = todos;
      });

      const getTodosHandler = new GetTodosHandler();
      expect(getTodosHandler.name).to.equal('AnonymousEndpointHandler');
    });

    it('should define a named handler class', () => {
      const GetTodosHandler = defineHandler(getTodos, function getTodosHandler(context) {
        context.response.body = todos;
      });

      const getTodosHandler = new GetTodosHandler();
      expect(getTodosHandler.name).to.equal('getTodosHandler');
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
      let match = getTodosHandler.match(request);

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

    it('should define an handler class that can handle requests', async () => {
      const GetTodosHandler = defineHandler(getTodos, context => {
        context.response.body = todos;
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
});
