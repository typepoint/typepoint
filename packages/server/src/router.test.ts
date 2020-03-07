import { defineEndpoint, Empty } from '@typepoint/shared';
import { Router } from './router';
import { createHandler, defineMiddleware, createMiddleware } from './index';

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
    const loginHandler = createHandler(loginEndpointDefinition, async () => {});
    const loggerMiddleware = createMiddleware(async () => {});
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

  it('can add more handlers', () => {
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
    const loginHandler = createHandler(loginEndpointDefinition, async () => {});

    const router = new Router();

    router.use();
    expect(router.handlers).toEqual([]);

    router.use(loginHandler);
    expect(router.handlers).toEqual([loginHandler]);
  });
});
