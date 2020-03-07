import { Constructor } from '@typepoint/shared';
import { EndpointHandler, EndpointMiddleware } from './types';

export interface ValidateAndTransformFunctionResult {
  value?: any;
  validationError?: Error | string | any;
}

export type ValidateAndTransformFunction = (
  input: any,
  Class?: Constructor<any> | any[] | undefined
) => ValidateAndTransformFunctionResult;

export interface RouterOptions {
  handlers?: EndpointHandler[];
  middleware?: EndpointMiddleware[];
  validateAndTransform?: ValidateAndTransformFunction;
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
