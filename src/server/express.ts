// TODO: Move this into separate package e.g. strongpoint-express

import * as clone from 'clone';
import * as express from 'express';
import * as httpStatusCodes from 'http-status-codes';

import { ValidationResult } from 'tsdv-joi/ValidationResult';
import {
  EndpointContext, EndpointHandler,
  IEndpointHandler, Request, Response,
  Router, UnprotectedRouter
} from '../server';
import { EndpointContextCustomMetadata } from '../server';
import { EndpointDefinitionClassInfo } from '../shared';
import { cleanseHttpMethod } from '../shared/http';
import { combineMiddlewares } from './express/middleware';
import { StrongPointExpressRequest } from './express/strongPointExpressRequest';
import { StrongPointExpressResponse } from './express/strongPointExpressResponse';
import { HandlerMatch, HandlerMatchIterator } from './middlewareHelper';

export interface ToMiddlewareOptions {
  expressMiddlewares?: express.RequestHandler[];
  log?: (...args: any[]) => void;
}

interface ValidateAndTransformOptions {
  context: EndpointContext<any, any, any>;
  handlerMatch: HandlerMatch;
  originalRequestBody: any;
  router: Router;
}

interface ValidateAndTransformParamsOptions {
  classInfo: EndpointDefinitionClassInfo<any, any, any> | undefined;
  context: EndpointContext<any, any, any>;
  router: Router;
}

function validateAndTransformParams(options: ValidateAndTransformParamsOptions): boolean {
  const { classInfo, context, router } = options;

  if (!router.validateAndTransform) {
    return true;
  }

  const requestParamsClass = classInfo && classInfo.request.params;
  if (!requestParamsClass) {
    return true;
  }

  const validationResult = router.validateAndTransform(context.request.params, requestParamsClass);
  if (validationResult.validationError) {
    context.response.statusCode = httpStatusCodes.BAD_REQUEST;
    context.response.body = validationResult.validationError;
    return false;
  }

  context.request.params = validationResult.value;
  return true;
}

interface ValidateAndTransformBodyOptions {
  classInfo: EndpointDefinitionClassInfo<any, any, any> | undefined;
  context: EndpointContext<any, any, any>;
  originalRequestBody: any;
  router: Router;
}

function validateAndTransformBody(options: ValidateAndTransformBodyOptions): boolean {
  const { classInfo, context, originalRequestBody, router } = options;

  if (!router.validateAndTransform) {
    return true;
  }

  const requestBodyClass = classInfo && classInfo.request.body;
  if (!requestBodyClass) {
    return true;
  }

  const validationResult = router.validateAndTransform(clone(originalRequestBody), requestBodyClass);
  if (validationResult.validationError) {
    context.response.statusCode = httpStatusCodes.BAD_REQUEST;
    context.response.body = validationResult.validationError;
    return false;
  }

  context.request.body = validationResult.value;
  return true;
}

function validateAndTransform(options: ValidateAndTransformOptions): boolean {
  const { context, handlerMatch, originalRequestBody, router } = options;

  const definition = handlerMatch.handler.definition;
  const classInfo = definition && definition.classInfo;

  if (!validateAndTransformParams({ classInfo, context, router })) {
    return false;
  }

  if (!validateAndTransformBody({ classInfo, context, originalRequestBody, router })) {
    return false;
  }

  return true;
}

function trySendInternalServerError(res: express.Response, err: Error | string | any) {
  if (!res.headersSent) {
    res.statusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
    res.json((err && err.message) || err);
    res.end();
  }
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
      const meta: EndpointContextCustomMetadata = {};
      const request = new StrongPointExpressRequest(req);
      const response = new StrongPointExpressResponse(res);
      context = { meta, request, response };
    } catch (err) {
      log('Error constructing context: ', err);
      trySendInternalServerError(res, err);
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

          if (!validateAndTransform({ context, handlerMatch, originalRequestBody, router })) {
            return;
          }

          if (handlerMatch.handler.name) {
            log(`Executing ${ handlerMatch.type }: ${ handlerMatch.handler.name }`);
          }

          await handlerMatch.handler.handle(context, executeNextHandler);
        }
      };

      await executeNextHandler();

      if (context.response.statusCode) {
        context.response.flush();
        res.end();
      } else {
        await next();
      }

    } catch (err) {
      log('ERROR: ', err);
      trySendInternalServerError(res, err);
    }
  };

  const allMiddleware: express.Handler[] = [
    ...(options && options.expressMiddlewares) || [],
    handlersMiddleware
  ];

  const combinedMiddleware = combineMiddlewares(allMiddleware);

  return combinedMiddleware;
}
