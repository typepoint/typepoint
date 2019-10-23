import * as clone from 'clone';
import * as express from 'express';
import * as httpStatusCodes from 'http-status-codes';
import {
  cleanseHttpMethod,
  EndpointDefinitionClassInfo,
  Logger,
  NoopLogger,
} from '@typepoint/shared';
import {
  EndpointContextCustomMetadata,
  EndpointContext, EndpointHandler,
  IEndpointHandler,
  HandlerMatch,
  HandlerMatchIterator,
  Request, Response,
  Router, UnprotectedRouter,
} from '@typepoint/server';
import { combineMiddlewares } from './middleware';
import { TypePointExpressRequest } from './typePointExpressRequest';
import { TypePointExpressResponse } from './typePointExpressResponse';

export interface ToMiddlewareOptions {
  expressMiddlewares?: express.RequestHandler[];
  logger?: Logger;
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
  const {
    classInfo, context, originalRequestBody, router,
  } = options;

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
  const {
    context, handlerMatch, originalRequestBody, router,
  } = options;

  const { definition } = handlerMatch.handler;
  const classInfo = definition && definition.classInfo;

  if (!validateAndTransformParams({ classInfo, context, router })) {
    return false;
  }

  if (!validateAndTransformBody({
    classInfo, context, originalRequestBody, router,
  })) {
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
  const logger = (options && options.logger) || new NoopLogger();

  const handlersMiddleware: express.RequestHandler = async (
    req: express.Request, res: express.Response, next: express.NextFunction,
  ) => {
    let context: EndpointContext<any, any, any> | undefined;

    const originalRequestBody = clone(req.body);

    try {
      const meta: EndpointContextCustomMetadata = {};
      const request = new TypePointExpressRequest(req);
      const response = new TypePointExpressResponse(res);
      context = { meta, request, response };
    } catch (err) {
      logger.error('Error constructing context: ', err);
      trySendInternalServerError(res, err);
    }

    if (!context) {
      return;
    }

    try {
      const allHandlers: IEndpointHandler[] = [
        ...router.getMiddlewares(),
        ...router.getHandlers(),
      ];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, {
        method: cleanseHttpMethod(req.method),
        url: req.url,
      });

      const executeNextHandler = async (): Promise<void> => {
        const handlerMatch = handlerMatchIterator.getNextMatch();
        if (context && handlerMatch) {
          context.request.params = handlerMatch.parsedUrl.params;

          if (!validateAndTransform({
            context, handlerMatch, originalRequestBody, router,
          })) {
            return;
          }

          if (handlerMatch.handler.name) {
            logger.debug(`Executing ${handlerMatch.type}: ${handlerMatch.handler.name}`);
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
      logger.error(err);
      trySendInternalServerError(res, err);
    }
  };

  const allMiddleware: express.Handler[] = [
    ...(options && options.expressMiddlewares) || [],
    handlersMiddleware,
  ];

  const combinedMiddleware = combineMiddlewares(allMiddleware);

  return combinedMiddleware;
}
