/* eslint-disable max-classes-per-file */
import { partialOf, deepPartialOf } from 'jest-helpers';
import { Todo } from '@typepoint/fixtures';
import { EndpointDefinitionClassInfo, Empty } from '@typepoint/shared';
import { EndpointHandler, EndpointContext, EndpointMiddleware } from './index';
import {
  HandlerMatch,
  HandlerMatchIterator,
  validateAndTransformRequestBody,
  validateAndTransformRequestParams,
  validateAndTransformRequestPayload,
} from './middlewareHelper';
import { Router } from './router';

describe('server/middlewareHelper', () => {
  describe('HandlerMatchIterator', () => {
    it('should return handlers that match', () => {
      const requestLogger = partialOf<EndpointMiddleware>({
      });

      const getProduct = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue({ id: '1337' }),
      });

      const getProducts = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined),
      });

      const allHandlers = [requestLogger, getProducts, getProduct];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, { method: 'GET', url: '/etc' });

      let handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeDefined();
      expect(handlerMatch).toHaveProperty('parsedUrl', {
        params: {},
        path: '/etc',
        postPath: '',
        prePath: '',
      });
      expect(handlerMatch).toHaveProperty('handler', requestLogger);

      handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeDefined();
      expect(handlerMatch).toHaveProperty('parsedUrl', { id: '1337' });
      expect(handlerMatch).toHaveProperty('handler', getProduct);

      handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeUndefined();
    });

    it('should return undefined when no matching handlers', () => {
      const handler1 = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined),
      });
      const handler2 = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined),
      });

      const allHandlers = [handler1, handler2];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, { method: 'GET', url: '/etc' });

      const handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeUndefined();
    });
  });

  describe('validateAndTransformRequestParams', () => {
    class GetTodoRequestParams {
      id?: number;
    }
    let classInfo: EndpointDefinitionClassInfo;

    it('should pass validation if no validateAndTransform function on router', () => {
      classInfo = new EndpointDefinitionClassInfo(
        GetTodoRequestParams,
        Empty,
        Todo,
      );
      const context = deepPartialOf<EndpointContext<GetTodoRequestParams, Empty, Todo>>({
        request: {
          params: {
          },
        },
        response: {},
      });
      const router = deepPartialOf<Router>({});
      const result = validateAndTransformRequestParams({
        classInfo,
        context,
        router,
      });
      expect(result).toBe(true);
    });

    it('should pass validation if no class info for request params', () => {
      classInfo = new EndpointDefinitionClassInfo(
        null as any,
        Empty,
        Todo,
      );
      const context = deepPartialOf<EndpointContext<GetTodoRequestParams, Empty, Todo>>({
        request: {
          params: {
          },
        },
        response: {},
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn(),
      });
      const result1 = validateAndTransformRequestParams({
        classInfo,
        context,
        router,
      });
      expect(result1).toBe(true);

      const result2 = validateAndTransformRequestParams({
        classInfo: undefined,
        context,
        router,
      });
      expect(result2).toBe(true);
    });

    it('should pass validation, and transform params when validateAndTransform passes validation', () => {
      classInfo = new EndpointDefinitionClassInfo(
        GetTodoRequestParams,
        Empty,
        Todo,
      );
      const context = deepPartialOf<EndpointContext<GetTodoRequestParams, Empty, Todo>>({
        request: {
          params: {
            id: '1',
          } as unknown as GetTodoRequestParams,
        },
        response: {},
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn().mockReturnValue({
          value: {
            id: 1,
          },
        }),
      });

      const result = validateAndTransformRequestParams({
        classInfo,
        context,
        router,
      });
      expect(result).toBe(true);
      expect(typeof context.request.params.id).toBe('number');
      expect(context.request.params.id).toBe(1);
    });

    it('should fail validation, and not transform params when validateAndTransform fails validation', () => {
      classInfo = new EndpointDefinitionClassInfo(
        GetTodoRequestParams,
        Empty,
        Todo,
      );
      const context = deepPartialOf<EndpointContext<GetTodoRequestParams, Empty, Todo>>({
        request: {
          params: {
            id: '-1',
          } as unknown as GetTodoRequestParams,
        },
        response: {},
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn().mockReturnValue({
          validationError: {
            message: 'id is not a valid id',
          },
        }),
      });

      const result = validateAndTransformRequestParams({
        classInfo,
        context,
        router,
      });
      expect(result).toBe(false);
      expect(context.response.statusCode).toBe(400);
      expect(context.response.body).toEqual({ message: 'id is not a valid id' });
      expect(typeof context.request.params.id === 'string').toBe(true);
      expect(context.request.params.id).toBe('-1');
    });
  });

  describe('validateAndTransformRequestBody', () => {
    class LoginRequestBody {
      emailAddress?: string;

      password?: string;

      rememberMe?: boolean;
    }
    let classInfo: EndpointDefinitionClassInfo;

    it('should pass validation if no validateAndTransform function on router', () => {
      classInfo = new EndpointDefinitionClassInfo(
        Empty,
        LoginRequestBody,
        Empty,
      );
      const originalRequestBody = {};
      const context = deepPartialOf<EndpointContext<Empty, LoginRequestBody, Empty>>({
        request: {
          body: {
            ...originalRequestBody,
          },
        },
        response: {},
      });
      const router = deepPartialOf<Router>({});
      const result = validateAndTransformRequestBody({
        classInfo,
        context,
        originalRequestBody,
        router,
      });
      expect(result).toBe(true);
    });

    it('should pass validation if no class info for request params', () => {
      classInfo = new EndpointDefinitionClassInfo(
        Empty,
        null as any,
        Empty,
      );
      const originalRequestBody = {};
      const context = deepPartialOf<EndpointContext<Empty, LoginRequestBody, Empty>>({
        request: {
          body: {
            ...originalRequestBody,
          },
        },
        response: {},
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn(),
      });
      const result1 = validateAndTransformRequestBody({
        classInfo,
        context,
        originalRequestBody,
        router,
      });
      expect(result1).toBe(true);

      const result2 = validateAndTransformRequestBody({
        classInfo: undefined,
        context,
        originalRequestBody,
        router,
      });
      expect(result2).toBe(true);
    });

    it('should pass validation, and transform params when validateAndTransform passes validation', () => {
      classInfo = new EndpointDefinitionClassInfo(
        Empty,
        LoginRequestBody,
        Empty,
      );
      const originalRequestBody = {
        emailAddress: 'hugh.hackman@example.com',
        password: '5w0rdFi$h',
        rememberMe: 'true',
      } as unknown as LoginRequestBody;
      const context = deepPartialOf<EndpointContext<Empty, LoginRequestBody, Empty>>({
        request: {
          body: {
            ...originalRequestBody,
          },
        },
        response: {},
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn().mockReturnValue({
          value: {
            ...originalRequestBody,
            rememberMe: true,
          },
        }),
      });

      const result = validateAndTransformRequestBody({
        classInfo,
        context,
        originalRequestBody,
        router,
      });
      expect(result).toBe(true);
      expect(typeof context.request.body.rememberMe).toBe('boolean');
      expect(context.request.body).toEqual({
        ...originalRequestBody,
        rememberMe: true,
      });
    });

    it('should fail validation, and not transform params when validateAndTransform fails validation', () => {
      classInfo = new EndpointDefinitionClassInfo(
        Empty,
        LoginRequestBody,
        Empty,
      );
      const originalRequestBody = {
        emailAddress: 'hugh.hackman@example.com',
        password: '5w0rdFi$h',
        rememberMe: 'true',
      } as unknown as LoginRequestBody;
      const context = deepPartialOf<EndpointContext<Empty, LoginRequestBody, Empty>>({
        request: {
          body: {
            ...originalRequestBody,
          },
        },
        response: {},
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn().mockReturnValue({
          validationError: {
            message: 'id is not a valid id',
          },
        }),
      });

      const result = validateAndTransformRequestBody({
        classInfo,
        context,
        originalRequestBody,
        router,
      });
      expect(result).toBe(false);
      expect(context.response.statusCode).toBe(400);
      expect(context.response.body).toEqual({ message: 'id is not a valid id' });
      expect(context.request.body).toEqual(originalRequestBody);
    });
  });

  describe('validateAndTransformRequestPayload', () => {
    it('should return false if params fail validation', () => {
      class GetTodoParams {
        id?: string;
      }

      const context = deepPartialOf<EndpointContext<GetTodoParams, Empty, Todo>>({
        request: {
          params: {
          },
        },
        response: {},
      });
      const handlerMatch = deepPartialOf<HandlerMatch>({
        handler: {
          definition: {
            classInfo: new EndpointDefinitionClassInfo(GetTodoParams, Empty, Todo),
          },
        },
      });
      const originalRequestBody = {};
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn().mockReturnValue({
          validationError: 'Invalid request params',
        }),
      });
      const result = validateAndTransformRequestPayload({
        context,
        handlerMatch,
        originalRequestBody,
        router,
      });
      expect(result).toBe(false);
      expect(router.validateAndTransform).toHaveBeenCalledWith({ }, GetTodoParams);
    });

    it('should return false if body fails validation', () => {
      class Login {
        username?: string;

        password?: string;
      }

      const originalRequestBody = {
        username: 'neo',
      };
      const context = deepPartialOf<EndpointContext<Empty, Login, Empty>>({
        request: {
          params: {
          },
          body: { ...originalRequestBody },
        },
        response: {},
      });
      const handlerMatch = deepPartialOf<HandlerMatch>({
        handler: {
          definition: {
            classInfo: new EndpointDefinitionClassInfo(Empty, Login, Empty),
          },
        },
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn()
          .mockReturnValueOnce((value: unknown) => ({
            value,
          }))
          .mockReturnValueOnce({
            validationError: 'Invalid request body',
          }),
      });
      const result = validateAndTransformRequestPayload({
        context,
        handlerMatch,
        originalRequestBody,
        router,
      });
      expect(result).toBe(false);
      expect(router.validateAndTransform).toHaveBeenCalledTimes(2);
      expect(router.validateAndTransform).toHaveBeenCalledWith({ }, Empty);
      expect(router.validateAndTransform).toHaveBeenCalledWith({ username: 'neo' }, Login);
    });

    it('should return true if params and body pass validation', () => {
      class PatchTodoParams {
        id?: string;
      }
      class PatchTodoBody {
        title?: string;
      }
      const originalRequestBody = {
        title: ' Feed the cats ',
      };
      const context = deepPartialOf<EndpointContext<PatchTodoParams, PatchTodoBody, Todo>>({
        request: {
          params: {
            id: 1 as unknown as string,
          },
          body: {
            ...originalRequestBody,
          },
        },
        response: {
        },
      });
      const handlerMatch = deepPartialOf<HandlerMatch>({
        handler: {
          definition: {
            classInfo: new EndpointDefinitionClassInfo(
              PatchTodoParams,
              PatchTodoBody,
              Todo,
            ),
          },
        },
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn()
          .mockImplementationOnce((value) => ({
            value: {
              id: '1',
            },
          }))
          .mockImplementationOnce((value) => ({
            value: {
              title: 'Feed the cats',
            },
          })),
      });
      const result = validateAndTransformRequestPayload({
        context,
        handlerMatch,
        originalRequestBody,
        router,
      });

      expect(result).toBe(true);
      expect(router.validateAndTransform).toHaveBeenCalledWith({ id: 1 }, PatchTodoParams);
      expect(router.validateAndTransform).toHaveBeenCalledWith({ title: ' Feed the cats ' }, PatchTodoBody);

      // Expect params and body to be transformed from the validateAndTransform calls
      expect(context.request.params).toEqual({ id: '1' });
      expect(context.request.body).toEqual({ title: 'Feed the cats' });
    });

    it('should return true if no endpoint definition class info available', () => {
      class PatchTodoParams {
        id?: string;
      }
      class PatchTodoBody {
        title?: string;
      }
      const originalRequestBody = {
        title: ' Feed the cats ',
      };
      const context = deepPartialOf<EndpointContext<PatchTodoParams, PatchTodoBody, Todo>>({
        request: {
          params: {
            id: 1 as unknown as string,
          },
          body: {
            ...originalRequestBody,
          },
        },
        response: {
        },
      });
      const handlerMatch = deepPartialOf<HandlerMatch>({
        handler: {},
      });
      const router = deepPartialOf<Router>({
        validateAndTransform: jest.fn()
          .mockImplementationOnce((value) => ({
            value: {
              id: '1',
            },
          }))
          .mockImplementationOnce((value) => ({
            value: {
              title: 'Feed the cats',
            },
          })),
      });
      const result = validateAndTransformRequestPayload({
        context,
        handlerMatch,
        originalRequestBody,
        router,
      });

      expect(result).toBe(true);
      expect(router.validateAndTransform).not.toHaveBeenCalled();
    });

    it('should return true if no validateAndTransform function on router', () => {
      class PatchTodoParams {
        id?: string;
      }
      class PatchTodoBody {
        title?: string;
      }
      const originalRequestBody = {
        title: 'Feed the cats',
      };
      const context = deepPartialOf<EndpointContext<PatchTodoParams, PatchTodoBody, Todo>>({
        request: {
          params: {
            id: '1',
          },
          body: {
            ...originalRequestBody,
          },
        },
        response: {
        },
      });
      const handlerMatch = deepPartialOf<HandlerMatch>({
        handler: {
          definition: {
            classInfo: new EndpointDefinitionClassInfo(
              PatchTodoParams,
              PatchTodoBody,
              Todo,
            ),
          },
        },
      });
      const router = deepPartialOf<Router>({});
      const result = validateAndTransformRequestPayload({
        context,
        handlerMatch,
        originalRequestBody,
        router,
      });

      expect(result).toBe(true);
      expect(context.request.params).toEqual({ id: '1' });
      expect(context.request.body).toEqual({ title: 'Feed the cats' });
    });
  });
});
