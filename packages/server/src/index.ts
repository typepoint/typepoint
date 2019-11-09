/* eslint-disable max-classes-per-file */
import { NOT_FOUND } from 'http-status-codes';
import {
  Constructor,
  EndpointDefinition,
  PathHelperParseMatch,
} from '@typepoint/shared';
import {
  RequestCookies,
  RequestHeaders,
  Request,
  ResponseHeaders,
  SetCookieOptions,
  ResponseContentType,
  Response,
  EndpointContextMetadata,
  EndpointContext,
  EndpointContextFromDefinition,
  EndpointHandlerFunctionFromDefinition,
  EndpointHandler,
  EndpointMiddleware,
} from './types';
import {
  HandlerMatch,
  HandlerMatchIterator,
} from './middlewareHelper';

export {
  RequestCookies,
  RequestHeaders,
  Request,
  ResponseHeaders,
  SetCookieOptions,
  ResponseContentType,
  Response,
  EndpointContextMetadata,
  EndpointContext,
  EndpointContextFromDefinition,
  EndpointHandlerFunctionFromDefinition,
  EndpointHandler,
  EndpointMiddleware,
  HandlerMatch,
  HandlerMatchIterator,
};

export class HeadersAlreadySent extends Error {
  constructor(message?: string) {
    let fullMessage = message ? `${message} - ` : '';
    fullMessage += 'Headers have already been sent';
    super(fullMessage);
  }
}

export function createHandler<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  definition: TEndpointDefinition,
  handler: EndpointHandlerFunctionFromDefinition<TEndpointDefinition>,
  name?: string,
): EndpointHandler {
  return {
    definition,
    handle: handler,
    match: (request: { method: string; url: string }): PathHelperParseMatch | undefined => {
      if (request.method !== definition.method) {
        return undefined;
      }
      const match = definition.parse(request.url);
      return match;
    },
    name: name || 'AnonymousEndpointHandler',
  };
}

export type EndpointMiddlewareHandlerFunction = (
  context: EndpointContext<any, any, any>, next: () => Promise<void>
) => Promise<void>;

export type EndpointMiddlewareClass = Constructor<EndpointMiddleware>;

export function defineMiddleware(
  handler: EndpointMiddlewareHandlerFunction,
  name?: string,
): EndpointMiddleware {
  return {
    handle: handler,
    name: name || 'AnonymousEndpointMiddleware',
  };
}

export interface ValidateAndTransformFunctionResult {
  value?: any;
  validationError?: Error | string | any;
}

export type ValidateAndTransformFunction = (
  input: any,
  Class?: Constructor<any>
) => ValidateAndTransformFunctionResult;

export interface RouterOptions {
  handlers?: EndpointHandler[];
  middleware?: EndpointMiddleware[];
  validateAndTransform?: ValidateAndTransformFunction;
}

export type RouterHandleMethod = (request: any, response: any) => Promise<void>;

export interface UnprotectedRouter {
  readonly handle: RouterHandleMethod;
}

export class HandlerConstructorError extends Error {
  constructor(Handler: EndpointHandler, innerError: Error | string | any) {
    let message = 'Error creating handler';
    if (Handler.name) {
      message += ` ${Handler.name}`;
    }
    if (innerError) {
      if (typeof innerError === 'string') {
        message += `: ${innerError}`;
      } else if (innerError.message) {
        message += `: ${innerError.message}`;
      }
      if (innerError.stack) {
        message += `\n\n${innerError.stack}`;
      }
    }
    super(message);
  }
}

export class Router {
  readonly validateAndTransform: ValidateAndTransformFunction | undefined;

  readonly handlers: EndpointHandler[];

  readonly middlewares: EndpointMiddleware[];

  constructor(options?: RouterOptions) {
    this.validateAndTransform = options && options.validateAndTransform;
    this.handlers = (options && options.handlers) || [];
    this.middlewares = (options && options.middleware) || [];
  }

  use(...handlers: EndpointHandler[]): this {
    if (handlers.length) {
      this.handlers.push(...handlers);
    }
    return this;
  }
}

export const notFoundMiddleware = () => defineMiddleware(async (context, next) => {
  await next();

  if (!context.response.hasFlushedHeaders && !context.response.statusCode) {
    context.response.statusCode = NOT_FOUND;
  }
}, 'notFoundMiddleware');

export const addHeadersMiddleware = (headers: { [name: string]: string }) => defineMiddleware(async (context, next) => {
  Object.entries(headers).forEach(([name, value]) => {
    context.response.header(name, value);
  });
  return next();
}, 'AddHeadersMiddleware');
