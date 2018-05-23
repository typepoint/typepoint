import * as httpStatusCodes from 'http-status-codes';
import { warnIfWindowDetected } from './server/clientDetection';
import { EndpointDefinition } from './shared';
import { Constructor } from './shared';
import { HttpMethod } from './shared/http';
import { PathHelper, PathHelperParseMatch } from './shared/pathHelper';

export interface RequestCookies {
  [name: string]: string | undefined;
}

export interface RequestHeaders {
  'accept'?: string;
  'access-control-allow-origin'?: string;
  'access-control-allow-credentials'?: string;
  'access-control-expose-headers'?: string;
  'access-control-max-age'?: string;
  'access-control-allow-methods'?: string;
  'access-control-allow-headers'?: string;
  'accept-patch'?: string;
  'accept-ranges'?: string;
  'age'?: string;
  'allow'?: string;
  'alt-svc'?: string;
  'cache-control'?: string;
  'connection'?: string;
  'content-disposition'?: string;
  'content-encoding'?: string;
  'content-language'?: string;
  'content-length'?: string;
  'content-location'?: string;
  'content-range'?: string;
  'content-type'?: string;
  'date'?: string;
  'expires'?: string;
  'host'?: string;
  'last-modified'?: string;
  'location'?: string;
  'pragma'?: string;
  'proxy-authenticate'?: string;
  'public-key-pins'?: string;
  'retry-after'?: string;
  'set-cookie'?: string[];
  'strict-transport-security'?: string;
  'trailer'?: string;
  'transfer-encoding'?: string;
  'tk'?: string;
  'upgrade'?: string;
  'vary'?: string;
  'via'?: string;
  'warning'?: string;
  'www-authenticate'?: string;
  [name: string]: string | string[] | undefined;
}

export interface Request<TRequestParams, TRequestBody> {
  readonly method: HttpMethod;
  readonly url: string;
  params: TRequestParams;
  body: TRequestBody;
  readonly cookies: RequestCookies;
  readonly headers: RequestHeaders;
  readonly signedCookies: RequestCookies;
  cookie(name: string): string | undefined;
  header(name: string): string | string[] | undefined;
  signedCookie(name: string): string | undefined;
}

export class HeadersAlreadySent extends Error {
  constructor(message?: string) {
    let fullMessage = message ? message + ' - ' : '';
    fullMessage += 'Headers have already been sent';
    super(fullMessage);
  }
}

export interface ResponseHeaders {
  [name: string]: string | string[] | number | undefined;
}

export interface SetCookieOptions {
  maxAge?: number;
  signed?: boolean;
  expires?: Date | boolean;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  secure?: boolean | 'auto';
  encode?: (val: string) => void;
  sameSite?: boolean | string;
}

export type ResponseContentType = 'application/json' | string;

export interface Response<TResponseBody> {
  statusCode: number | undefined;
  contentType: ResponseContentType;
  body: TResponseBody | undefined;

  readonly hasFlushedHeaders: boolean;
  readonly hasFlushed: boolean;

  flush(): void;
  flushHeaders(): void;

  cookie(name: string, value: string, options?: SetCookieOptions): void;
  clearCookie(name: string, options?: SetCookieOptions): void;

  header(name: string): string | string[] | number | undefined;
  header(name: string, value: string | string[] | number | undefined): void;
  headers(): ResponseHeaders;
}

// Use Interface Merging to add your own custom fields to the `EndpointContextCustomMetadata` declaration
// and implement and use your own middleware to actually add the fields to `context.meta`

// tslint:disable-next-line:no-empty-interface
export interface EndpointContextCustomMetadata {
}

export interface EndpointContext<TRequestParams, TRequestBody, TResponseBody> {
  meta: EndpointContextCustomMetadata;
  request: Request<TRequestParams, TRequestBody>;
  response: Response<TResponseBody>;
}

export type EndpointHandlerFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  (
    context: EndpointContext<
      ReturnType<TEndpointDefinition['typeInfo']>['request']['params'],
      ReturnType<TEndpointDefinition['typeInfo']>['request']['body'],
      ReturnType<TEndpointDefinition['typeInfo']>['response']['body']
      >,
    next: () => Promise<void>
  ) => Promise<void> | void;

export interface IEndpointHandler {
  readonly name: string;
  readonly definition?: EndpointDefinition<any, any, any>;
  match?: (request: { method: string, url: string }) => PathHelperParseMatch | undefined;
  handle(context: EndpointContext<any, any, any>, next: () => Promise<void>): Promise<void> | void;
}

export class CannotRedefineHandlerDefinition extends Error {
  constructor() {
    super('EndpointHandler.definition should only be set in define method during handler construction');
  }
}

export abstract class EndpointHandler implements IEndpointHandler {
  get definition(): EndpointDefinition<any, any, any> {
    return this._definition;
  }

  set definition(value: EndpointDefinition<any, any, any>) {
    if (!this._isDefining) {
      throw new CannotRedefineHandlerDefinition();
    }
    this._definition = value;
  }

  // `= undefined as any` is a crappy workaround strictPropertyInitialization in ts 2.7
  // without having to disable strictPropertyInitialization everywhere.
  // Deliberately don't pass handler function down in constructor as then compiler cannot infer
  // types for context and next function :(
  // tslint:disable:variable-name
  private _definition: EndpointDefinition<any, any, any> = undefined as any;
  private _isDefining: boolean = false;
  // tslint:enable:variable-name
  private handler: EndpointHandlerFunction<any> = undefined as any;
  private pathHelper: PathHelper = undefined as any;

  get name(): string {
    return this.constructor.name;
  }

  match(request: { method: string, url: string }): PathHelperParseMatch | undefined {
    if (request.method !== this.definition.method) {
      return undefined;
    }

    const match = this.definition.parse(request.url);
    return match;
  }

  handle(context: EndpointContext<any, any, any>, next: () => Promise<void>): Promise<void> | void {
    return this.handler(context, next);
  }

  protected define<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    handler: EndpointHandlerFunction<TEndpointDefinition>
  ) {
    this._isDefining = true;
    try {
      this.definition = definition;
      this.handler = handler;
    } finally {
      this._isDefining = false;
    }
  }
}

export type EndpointHandlerClass = Constructor<EndpointHandler>;

export function defineHandler<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  definition: TEndpointDefinition,
  handler: EndpointHandlerFunction<TEndpointDefinition>,
  name?: string
): EndpointHandlerClass {
  class AnonymousEndpointHandler extends EndpointHandler {
    constructor() {
      super();
      this.define(definition, handler);
    }

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

  handle(context: EndpointContext<any, any, any>, next: () => Promise<void>): void | Promise<void> {
    this.handler(context, next);
  }

  define(handler: EndpointMiddlewareHandlerFunction) {
    this.handler = handler;
  }
}

export type EndpointMiddlewareClass = Constructor<EndpointMiddleware>;

export function defineMiddleware(
  handler: EndpointMiddlewareHandlerFunction,
  name?: string
): EndpointMiddlewareClass {
  class AnonymousEndpointMiddleware extends EndpointMiddleware {
    constructor() {
      super();
      this.define(handler);
    }

    get name(): string {
      return name || 'AnonymousEndpointMiddleware';
    }
  }

  return AnonymousEndpointMiddleware;
}

export interface RouterIoc {
  get<T>(Class: Constructor<T>): T;
}

export type ObjectWithStringProps<T> = { [K in keyof T]: string };

export interface ValidateAndTransformFunctionResult<TValue> {
  value?: TValue;
  validationError?: Error | string | any;
}

// tslint:disable-next-line:ban-types
export type ValidateAndTransformFunction = <T extends Object>(
  input: ObjectWithStringProps<T>,
  Class?: Constructor<T>
) => ValidateAndTransformFunctionResult<T>;

export interface RouterOptions {
  handlers?: EndpointHandlerClass[];
  ioc?: RouterIoc;
  middleware?: EndpointMiddlewareClass[];
  validateAndTransform?: ValidateAndTransformFunction;
}

export type RouterHandleMethod = (request: Request<any, any>, response: Response<any>) => Promise<void>;

export interface UnprotectedRouter {
  readonly handle: RouterHandleMethod;
}

export class HandlerConstructorError extends Error {
  constructor(Handler: EndpointHandlerClass, innerError: Error | string | any) {
    let message = `Error creating handler`;
    if (Handler.name) {
      message += ` ${ Handler.name }`;
    }
    if (innerError) {
      if (typeof innerError === 'string') {
        message += `: ${ innerError }`;
      } else if (innerError.message) {
        message += `: ${ innerError.message }`;
      }
      if (innerError.stack) {
        message += `\n\n${ innerError.stack }`;
      }
    }
    super(message);
  }
}

export class MiddlewareConstructorError extends Error {
  constructor(Middleware: EndpointMiddlewareClass, innerError: Error | string | any) {
    let message = `Error creating handler`;
    if (Middleware.name) {
      message += ` ${ Middleware.name }`;
    }
    if (innerError) {
      if (typeof innerError === 'string') {
        message += `: ${ innerError }`;
      } else if (innerError.message) {
        message += `: ${ innerError.message }`;
      }
      if (innerError.stack) {
        message += `\n\n${ innerError.stack }`;
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
      get: <T>(Class: Constructor<T>) => {
        return new Class();
      }
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

  // tslint:disable-next-line:max-line-length
  // TODO: Consider replacing getHandlers and getMiddlewares with method that returns a consolidated promise-based middleware creator?

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
    const result: EndpointHandler[] = this.handlerClasses.map(Handler => this.createHandler(Handler));
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
    const result: EndpointMiddleware[] = this.middlewareClasses.map(Middleware => this.createMiddleware(Middleware));
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

declare const window: any | undefined;

warnIfWindowDetected(typeof window === 'undefined' ? undefined : window, console);
