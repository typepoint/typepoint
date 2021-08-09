import * as express from 'express';
import {
  cleanseHttpMethod,
  Logger,
} from '@typepoint/shared';
import {
  EndpointContext,
  HandlerMatchIterator,
  Router,
  validateAndTransformRequestPayload,
} from '@typepoint/server';
import * as clone from 'clone';
import { combineMiddlewares } from './middleware';
import { createContext, getLogger, trySendInternalServerError } from './utils';

export interface ToMiddlewareOptions {
  expressMiddlewares?: express.RequestHandler[];
  logger?: Logger;
}

export function toMiddleware(router: Router, options?: ToMiddlewareOptions): express.RequestHandler {
  const logger = getLogger(options);

  const handlersMiddleware: express.RequestHandler = async (
    req: express.Request, res: express.Response, next: express.NextFunction,
  ) => {
    let context: EndpointContext<any, any, any> | undefined;

    const originalRequestBody = clone(req.body);

    try {
      context = createContext(req, res);
    } catch (err) {
      logger.error('Error constructing context: ', err);
      trySendInternalServerError(res, err);
    }

    if (!context) {
      return;
    }

    try {
      const handlerMatchIterator = new HandlerMatchIterator([...router.middlewares, ...router.handlers], {
        method: cleanseHttpMethod(req.method),
        url: req.url,
      });

      const executeNextHandler = async (): Promise<void> => {
        const handlerMatch = handlerMatchIterator.getNextMatch();
        if (context && handlerMatch) {
          context.request.params = handlerMatch.parsedUrl.params;

          if (!validateAndTransformRequestPayload({
            context, handlerMatch, originalRequestBody, router,
          })) {
            return;
          }

          if (handlerMatch.handler.name) {
            logger.debug(`Executing ${handlerMatch.type}: ${handlerMatch.handler.name}`);
          }

          await handlerMatch.handler.handle(context, executeNextHandler);

          if (handlerMatch.handler.name) {
            logger.debug(`Executed ${handlerMatch.type}: ${handlerMatch.handler.name}`);
          }
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
