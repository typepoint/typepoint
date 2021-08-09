import { Constructor } from '@typepoint/shared';
import { EndpointHandler, EndpointMiddleware, hasDefinition } from './types';

const getPathDepth = (path: string) => path.split('/').length;

const getPathParamCount = (path: string) => path.split(':').length - 1;

function sortHandlersByMatchOrder(
  handlers: Array<EndpointHandler>,
): Array<EndpointHandler> {
  const sortedHandlers = handlers.sort((a, b) => {
    const aDepth = getPathDepth(a.definition.path);
    const bDepth = getPathDepth(b.definition.path);

    // First sort by path depth descending
    const depthComparison = aDepth - bDepth;
    if (depthComparison !== 0) {
      return -depthComparison;
    }

    // Then sort by parameter count ascending
    const aParamCount = getPathParamCount(a.definition.path);
    const bParamCount = getPathParamCount(b.definition.path);
    const paramComparison = aParamCount - bParamCount;
    if (paramComparison !== 0) {
      return paramComparison;
    }

    // Finally sort by path name ascending
    const pathComparison = a.definition.path.localeCompare(b.definition.path);
    return pathComparison;
  });

  return sortedHandlers;
}

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

  private unsortedHandlers: Array<EndpointHandler> = [];

  private sortedHandlers?: readonly EndpointHandler[];

  get handlers(): readonly EndpointHandler[] {
    if (!this.sortedHandlers) {
      this.sortedHandlers = Object.freeze(
        sortHandlersByMatchOrder(this.unsortedHandlers),
      );
    }
    return this.sortedHandlers;
  }

  readonly middlewares: EndpointMiddleware[];

  constructor(options?: RouterOptions) {
    this.validateAndTransform = options && options.validateAndTransform;
    this.unsortedHandlers = [...(options && options.handlers) || []];
    this.middlewares = (options && options.middleware) || [];
  }

  use(...handlers: Array<EndpointMiddleware | EndpointHandler>): this {
    handlers.forEach((handlerOrMiddleware) => {
      if (hasDefinition(handlerOrMiddleware)) {
        this.unsortedHandlers = [...this.unsortedHandlers, handlerOrMiddleware];
        this.sortedHandlers = undefined;
      } else {
        this.middlewares.push(handlerOrMiddleware);
      }
    });
    return this;
  }
}
