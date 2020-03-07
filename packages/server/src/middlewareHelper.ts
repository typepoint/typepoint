import { BAD_REQUEST } from 'http-status-codes';
import {
  EndpointDefinitionClassInfo,
  PathHelperParseMatch,
  parseQueryString,
  parseUrl,
} from '@typepoint/shared';
import {
  EndpointContext,
  EndpointHandler,
  EndpointMiddleware,
} from './types';
import { Router } from './router';

import clone = require('clone');

export interface HandlerMatch {
  type: 'handler' | 'middleware';
  handler: EndpointHandler | EndpointMiddleware;
  parsedUrl: PathHelperParseMatch;
}

export class HandlerMatchIterator {
  private handlerIndex = 0;

  constructor(
    private handlers: (EndpointMiddleware | EndpointHandler)[],
    private request: { method: string; url: string },
  ) {
  }

  getNextMatch(): HandlerMatch | undefined {
    while (this.handlerIndex < this.handlers.length) {
      const handler = this.handlers[this.handlerIndex++];
      if ('match' in handler && handler.match) {
        const parsedUrl = handler.match(this.request);
        if (parsedUrl) {
          return {
            type: 'handler',
            handler,
            parsedUrl,
          };
        }
      } else {
        const parsedUrl = parseUrl(this.request.url);
        const params = parseQueryString(parsedUrl.postPath);
        return {
          type: 'middleware',
          handler,
          parsedUrl: {
            ...parsedUrl,
            params,
          },
        };
      }
    }
    return undefined;
  }
}

interface ValidateAndTransformOptions {
  context: EndpointContext<any, any, any>;
  handlerMatch: HandlerMatch;
  originalRequestBody: any;
  router: Router;
}

interface ValidateAndTransformParamsOptions {
  classInfo: EndpointDefinitionClassInfo | undefined;
  context: EndpointContext<any, any, any>;
  router: Router;
}

export function validateAndTransformRequestParams(options: ValidateAndTransformParamsOptions): boolean {
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
    context.response.statusCode = BAD_REQUEST;
    context.response.body = validationResult.validationError;
    return false;
  }

  context.request.params = validationResult.value;
  return true;
}

interface ValidateAndTransformBodyOptions {
  classInfo: EndpointDefinitionClassInfo | undefined;
  context: EndpointContext<any, any, any>;
  originalRequestBody: any;
  router: Router;
}

export function validateAndTransformRequestBody(options: ValidateAndTransformBodyOptions): boolean {
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
    context.response.statusCode = BAD_REQUEST;
    context.response.body = validationResult.validationError;
    return false;
  }

  context.request.body = validationResult.value;
  return true;
}

export function validateAndTransformRequestPayload(options: ValidateAndTransformOptions): boolean {
  const {
    context, handlerMatch: { handler }, originalRequestBody, router,
  } = options;

  const definition = 'definition' in handler ? handler.definition : undefined;
  const classInfo = definition && definition.classInfo;

  if (!validateAndTransformRequestParams({ classInfo, context, router })) {
    return false;
  }

  if (!validateAndTransformRequestBody({
    classInfo, context, originalRequestBody, router,
  })) {
    return false;
  }

  return true;
}
