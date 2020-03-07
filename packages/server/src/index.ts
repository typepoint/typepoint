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
  validateAndTransformRequestPayload,
} from './middlewareHelper';
import {
  Router,
  RouterOptions,
  ValidateAndTransformFunction,
  ValidateAndTransformFunctionResult,
} from './router';

export {
  Router,
  RequestCookies,
  RequestHeaders,
  Request,
  ResponseHeaders,
  RouterOptions,
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
  ValidateAndTransformFunction,
  ValidateAndTransformFunctionResult,
  validateAndTransformRequestPayload,
};

export class HeadersAlreadySent extends Error {
  constructor(message?: string) {
    let fullMessage = message ? `${message} - ` : '';
    fullMessage += 'Headers have already been sent';
    /* istanbul ignore next */
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

export function createMiddleware(
  handler: EndpointMiddlewareHandlerFunction,
  name?: string,
): EndpointMiddleware {
  return {
    handle: handler,
    name: name || 'AnonymousEndpointMiddleware',
  };
}

export const defineMiddleware = createMiddleware;

export type RouterHandleMethod = (request: any, response: any) => Promise<void>;

export interface UnprotectedRouter {
  readonly handle: RouterHandleMethod;
}

export const notFoundMiddleware = () => createMiddleware(async (context, next) => {
  await next();

  if (!context.response.hasFlushedHeaders && !context.response.statusCode) {
    context.response.statusCode = NOT_FOUND;
  }
}, 'notFoundMiddleware');

export const addHeadersMiddleware = (headers: { [name: string]: string }) => createMiddleware(async (context, next) => {
  Object.entries(headers).forEach(([name, value]) => {
    context.response.header(name, value);
  });
  return next();
}, 'AddHeadersMiddleware');
