import { defineEndpoint, Empty } from '@typepoint/shared';
import { Router } from './router';
import { createHandler, defineMiddleware, createMiddleware } from './index';
import { getDefinitionAndHandlerFixtures } from './fixtures';

describe('Router', () => {
  it('can be constructed without any options', () => {
    const router = new Router();
    expect(router.handlers).toEqual([]);
    expect(router.middlewares).toEqual([]);
    expect(router.validateAndTransform).toEqual(undefined);
  });

  it('can be constructed with options', () => {
    class LoginRequestBody {
      emailAddress?: string;

      password?: string;
    }
    const loginEndpointDefinition = defineEndpoint({
      path: (p) => p.literal('/api/login'),
      method: 'post',
      requestParams: Empty,
      requestBody: LoginRequestBody,
      responseBody: Empty,
    });
    const loginHandler = createHandler(loginEndpointDefinition, jest.fn());
    const loggerMiddleware = createMiddleware(jest.fn());
    const handlers = [loginHandler];
    const middleware = [loggerMiddleware];
    const validateAndTransform = jest.fn();
    const router = new Router({
      handlers,
      middleware,
      validateAndTransform,
    });
    expect(router.handlers).toEqual(handlers);
    expect(router.middlewares).toEqual(middleware);
    expect(router.validateAndTransform).toEqual(validateAndTransform);
  });

  it('can add more middleware and/or handlers', () => {
    class LoginRequestBody {
      emailAddress?: string;

      password?: string;
    }
    const loginEndpointDefinition = defineEndpoint({
      path: (p) => p.literal('/api/login'),
      method: 'post',
      requestParams: Empty,
      requestBody: LoginRequestBody,
      responseBody: Empty,
    });
    const loginHandler = createHandler(loginEndpointDefinition, jest.fn());

    const requestLogger = createMiddleware(jest.fn());

    const router = new Router();
    expect(router.middlewares).toEqual([]);
    expect(router.handlers).toEqual([]);

    router.use(loginHandler);
    expect(router.middlewares).toEqual([]);
    expect(router.handlers).toEqual([loginHandler]);

    router.use(requestLogger);
    expect(router.middlewares).toEqual([requestLogger]);
    expect(router.handlers).toEqual([loginHandler]);
  });

  it('automatically sorts handlers by match order', () => {
    const { handlers, handlersByName, middlewares } = getDefinitionAndHandlerFixtures();

    const router = new Router({ handlers, middleware: middlewares });

    expect(router.handlers).toEqual([
      handlersByName.getProductsInStockHandler,
      handlersByName.getProductsOutOfStockHandler,
      handlersByName.getProductHandler,
      handlersByName.getTodoHandler,
      handlersByName.getProductsHandler,
      handlersByName.getTodosHandler,
    ]);
  });
});
