// eslint-disable-next-line max-classes-per-file
import * as httpStatusCodes from 'http-status-codes';
import {
  Constructor,
  EndpointDefinition,
  PathHelper,
  PathHelperParseMatch,
} from '@typepoint/shared';
import {
  EndpointContext,
  EndpointHandlerFunction,
  IEndpointHandler,
} from './types';

export {
  RequestCookies,
  RequestHeaders,
  Request,
  ResponseHeaders,
  SetCookieOptions,
  ResponseContentType,
  Response,
  EndpointContextCustomMetadata,
  EndpointContext,
  EndpointContextFromDefinition,
  EndpointHandlerFunction,
  IEndpointHandler,
} from './types';
export {
  HandlerMatch,
  HandlerMatchIterator,
} from './middlewareHelper';

export class HeadersAlreadySent extends Error {
  constructor(message?: string) {
    let fullMessage = message ? `${message} - ` : '';
    fullMessage += 'Headers have already been sent';
    super(fullMessage);
  }
}

export class CannotRedefineHandlerDefinition extends Error {
  constructor() {
    super('EndpointHandler.definition should only be set in define method during handler construction');
  }
}

export abstract class EndpointHandler implements IEndpointHandler {
  get definition(): EndpointDefinition<any, any, any> {
    // eslint-disable-next-line no-underscore-dangle
    return this._definition;
  }

  set definition(value: EndpointDefinition<any, any, any>) {
    // eslint-disable-next-line no-underscore-dangle
    if (!this._isDefining) {
      throw new CannotRedefineHandlerDefinition();
    }
    // eslint-disable-next-line no-underscore-dangle
    this._definition = value;
  }

  // `= undefined as any` is a crappy workaround strictPropertyInitialization in ts 2.7
  // without having to disable strictPropertyInitialization everywhere.
  // Deliberately don't pass handler function down in constructor as then compiler cannot infer
  // types for context and next function :(
  // tslint:disable:variable-name
  private _definition: EndpointDefinition<any, any, any> = undefined as any;

  private _isDefining = false;

  // tslint:enable:variable-name
  private handler: EndpointHandlerFunction<any> = undefined as any;

  private pathHelper: PathHelper = undefined as any;

  get name(): string {
    return this.constructor.name;
  }

  match(request: { method: string; url: string }): PathHelperParseMatch | undefined {
    if (request.method !== this.definition.method) {
      return undefined;
    }

    const match = this.definition.parse(request.url);
    return match;
  }

  async handle(context: EndpointContext<any, any, any>, next: () => Promise<void>): Promise<void> {
    return this.handler(context, next);
  }

  protected define<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    handler: EndpointHandlerFunction<TEndpointDefinition>,
  ) {
    // eslint-disable-next-line no-underscore-dangle
    this._isDefining = true;
    try {
      this.definition = definition;
      this.handler = handler;
    } finally {
      // eslint-disable-next-line no-underscore-dangle
      this._isDefining = false;
    }
  }
}

export type EndpointHandlerClass = Constructor<EndpointHandler>;

export function defineHandler<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  definition: TEndpointDefinition,
  handler: EndpointHandlerFunction<TEndpointDefinition>,
  name?: string,
): EndpointHandlerClass {
  class AnonymousEndpointHandler extends EndpointHandler {
    constructor() {
      super();
      this.define(definition, handler);
    }

    // eslint-disable-next-line class-methods-use-this
    get name(): string {
      return name || 'AnonymousEndpointHandler';
    }
  }

  return AnonymousEndpointHandler;
}

export type EndpointMiddlewareHandlerFunction = (
  context: EndpointContext<any, any, any>, next: () => Promise<void>
) => Promise<void> | void;

export class EndpointMiddleware implements IEndpointHandler {
  // `= undefined as any` is a crappy workaround strictPropertyInitialization in ts 2.7
  // without having to disable strictPropertyInitialization everywhere.
  // Deliberately don't pass handler function down in constructor as inversify ioc library doesn't like
  // descendant EndpointMiddleware classes to have less params in constructor than there exist in the
  // base class's constructor (not sure why? seems dumb but probably a good reason why)
  private handler: EndpointMiddlewareHandlerFunction = undefined as any;

  // constructor(private readonly handler: EndpointMiddlewareHandlerFunction) {
  // }

  get name(): string {
    return this.constructor.name;
  }

  async handle(context: EndpointContext<any, any, any>, next: () => Promise<void>): Promise<void> {
    await this.handler(context, next);
  }

  protected define(handler: EndpointMiddlewareHandlerFunction) {
    this.handler = handler;
  }
}

export type EndpointMiddlewareClass = Constructor<EndpointMiddleware>;

export function defineMiddleware(
  handler: EndpointMiddlewareHandlerFunction,
  name?: string,
): EndpointMiddlewareClass {
  class AnonymousEndpointMiddleware extends EndpointMiddleware {
    constructor() {
      super();
      this.define(handler);
    }

    // eslint-disable-next-line class-methods-use-this
    get name(): string {
      return name || 'AnonymousEndpointMiddleware';
    }
  }

  return AnonymousEndpointMiddleware;
}

export interface RouterIoc {
  get<T>(Class: Constructor<T>): T;
}

export interface ValidateAndTransformFunctionResult {
  value?: any;
  validationError?: Error | string | any;
}

// tslint:disable-next-line:ban-types
export type ValidateAndTransformFunction = (
  input: any,
  Class?: Constructor<any>
) => ValidateAndTransformFunctionResult;

export interface RouterOptions {
  handlers?: EndpointHandlerClass[];
  ioc?: RouterIoc;
  middleware?: EndpointMiddlewareClass[];
  validateAndTransform?: ValidateAndTransformFunction;
}

export type RouterHandleMethod = (request: any, response: any) => Promise<void>;

export interface UnprotectedRouter {
  readonly handle: RouterHandleMethod;
}

export class HandlerConstructorError extends Error {
  constructor(Handler: EndpointHandlerClass, innerError: Error | string | any) {
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

export class MiddlewareConstructorError extends Error {
  constructor(Middleware: EndpointMiddlewareClass, innerError: Error | string | any) {
    let message = 'Error creating handler';
    if (Middleware.name) {
      message += ` ${Middleware.name}`;
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

  protected readonly handlerClasses: EndpointHandlerClass[] = [];

  protected handlers: EndpointHandler[] | undefined;

  protected readonly middlewareClasses: EndpointMiddlewareClass[] = [];

  protected middlewares: EndpointMiddleware[] | undefined;

  private readonly ioc: RouterIoc;

  constructor(options?: RouterOptions) {
    this.ioc = (options && options.ioc) || {
      get: <T>(Class: Constructor<T>) => new Class(),
    };

    this.validateAndTransform = options && options.validateAndTransform;

    const handlers = (options && options.handlers) || [];
    if (handlers.length) {
      this.handlerClasses.push(...handlers);
    }

    const middlewares = (options && options.middleware) || [];
    if (middlewares.length) {
      this.middlewareClasses.push(...middlewares);
    }
  }

  use(...handlers: EndpointHandlerClass[]): this {
    if (handlers.length) {
      this.handlerClasses.push(...handlers);
      this.handlers = undefined;
    }
    return this;
  }

  // TODO: Replace getHandlers & getMiddlewares w/ method returning consolidated promise-based middleware creator?

  getHandlers(): EndpointHandler[] {
    if (!this.handlers) {
      this.handlers = this.createHandlers();
    }
    return this.handlers;
  }

  getMiddlewares(): EndpointMiddleware[] {
    if (!this.middlewares) {
      this.middlewares = this.createMiddlewares();
    }
    return this.middlewares;
  }

  // TODO: Add test for creating handlers and middleware not using ioc

  private createHandler(Handler: Constructor<EndpointHandler>) {
    try {
      return this.ioc.get(Handler);
    } catch (err) {
      throw new HandlerConstructorError(Handler, err);
    }
  }

  private createHandlers(): EndpointHandler[] {
    const result: EndpointHandler[] = this.handlerClasses.map((Handler) => this.createHandler(Handler));
    return result;
  }

  private createMiddleware(Middleware: Constructor<EndpointMiddleware>) {
    try {
      return this.ioc.get(Middleware);
    } catch (err) {
      throw new MiddlewareConstructorError(Middleware, err);
    }
  }

  private createMiddlewares(): EndpointMiddleware[] {
    const result: EndpointMiddleware[] = this.middlewareClasses.map((Middleware) => this.createMiddleware(Middleware));
    return result;
  }
}

export class NotFoundMiddleware extends EndpointMiddleware {
  constructor() {
    super();
    this.define(async (context, next) => {
      await next();

      if (!context.response.hasFlushedHeaders && !context.response.statusCode) {
        context.response.statusCode = httpStatusCodes.NOT_FOUND;
      }
    });
  }
}
