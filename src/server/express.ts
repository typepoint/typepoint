// TODO: Move this into separate package e.g. strongpoint-express

import * as clone from 'clone';
import * as express from 'express';
import * as httpStatusCodes from 'http-status-codes';

import {
  EndpointContext, EndpointHandler,
  IEndpointHandler, Request, Response,
  Router, UnprotectedRouter
} from '../server';
import { cleanseHttpMethod } from '../shared/http';
import { combineMiddlewares } from './express/middleware';
import { StrongPointExpressRequest } from './express/strongPointExpressRequest';
import { StrongPointExpressResponse } from './express/strongPointExpressResponse';
import { HandlerMatchIterator } from './middlewareHelper';

export interface ToMiddlewareOptions {
  expressMiddlewares?: express.RequestHandler[];
  log?: (...args: any[]) => void;
}

export function toMiddleware(router: Router, options?: ToMiddlewareOptions): express.RequestHandler {

  // tslint:disable-next-line:no-empty
  const noop = () => { };

  const log = (options && options.log) || noop;

  const handlersMiddleware: express.RequestHandler = async (
    req: express.Request, res: express.Response, next: express.NextFunction
  ) => {
    let context: EndpointContext<any, any, any> | undefined;

    const originalRequestBody = clone(req.body);

    try {
      const request = new StrongPointExpressRequest(req);
      const response = new StrongPointExpressResponse(res);
      context = { request, response };
    } catch (err) {
      log('Error constructing context: ', err);
      res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
      res.end();
    }

    if (!context) {
      return;
    }

    try {
      const allHandlers: IEndpointHandler[] = [
        ...router.getMiddlewares(),
        ...router.getHandlers()
      ];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, {
        method: cleanseHttpMethod(req.method),
        url: req.url
      });

      const executeNextHandler = async () => {
        const handlerMatch = handlerMatchIterator.getNextMatch();
        if (context && handlerMatch) {
          context.request.params = handlerMatch.parsedUrl.params;

          if (router.validateAndTransform) {
            const definition = handlerMatch.handler.definition;
            const classInfo = definition && definition.classInfo;

            const requestParamsClass = classInfo && classInfo.request.params;
            if (requestParamsClass) {
              const validationResult = router.validateAndTransform(context.request.params, requestParamsClass);
              if (validationResult.validationError) {
                context.response.statusCode = httpStatusCodes.BAD_REQUEST;
                context.response.body = validationResult.validationError;
                return;
              }
              context.request.params = validationResult.value;
            }

            const requestBodyClass = classInfo && classInfo.request.body;
            if (requestBodyClass) {
              const validationResult = router.validateAndTransform(originalRequestBody, requestBodyClass);
              if (validationResult.validationError) {
                context.response.statusCode = httpStatusCodes.BAD_REQUEST;
                context.response.body = validationResult.validationError;
                return;
              }
            }
          }

          const type = handlerMatch.type;
          const handlerName = handlerMatch.handler.name;
          if (handlerName) {
            log(`Executing ${ type }: ${ handlerName }`);
          }
          await handlerMatch.handler.handle(context, executeNextHandler);
        }
      };

      await executeNextHandler();

      if (context.response.statusCode) {
        context.response.flush();
        res.end();
      } else {
        next();
      }

    } catch (err) {
      log('ERROR: ', err);
      if (!context.response.hasFlushedHeaders) {
        context.response.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
        context.response.body = err && err.message;
        context.response.flush();
        res.end();
      }
    }
  };

  const allMiddleware: express.Handler[] = [
    ...(options && options.expressMiddlewares) || [],
    handlersMiddleware
  ];

  const combinedMiddleware = combineMiddlewares(allMiddleware);

  return combinedMiddleware;
}
