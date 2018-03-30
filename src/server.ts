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
  readonly body: TRequestBody;
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

export interface Response<TResponseBody> {
  statusCode: number | undefined;

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

export interface EndpointContext<TRequestParams, TRequestBody, TResponseBody> {
  request: Request<TRequestParams, TRequestBody>;
  response: Response<TResponseBody>;
}

export type EndpointHandlerFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  (context: EndpointContext<
    TEndpointDefinition['typeInfo']['request']['params'],
    TEndpointDefinition['typeInfo']['request']['body'],
    TEndpointDefinition['typeInfo']['response']['body']
    >) => Promise<void> | void;

export abstract class EndpointHandler {
  // `= undefined as any` is a crappy workaround strictPropertyInitialization in ts 2.7
  // without having to disable strictPropertyInitialization everywhere
  private definition: EndpointDefinition<any, any, any> = undefined as any;
  private handler: EndpointHandlerFunction<any> = undefined as any;
  private pathHelper: PathHelper = undefined as any;

  public get name(): string {
    return this.constructor.name;
  }

  public match(request: { method: string, url: string }): PathHelperParseMatch | undefined {
    if (request.method !== this.definition.method) {
      return undefined;
    }

    const match = this.definition.parse(request.url);
    return match;
  }

  public handle(context: EndpointContext<any, any, any>, next: () => Promise<void>) {
    return this.handler(context);
  }

  protected define<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    handler: EndpointHandlerFunction<TEndpointDefinition>
  ) {
    this.definition = definition;
    this.handler = handler;
  }
}

export type EndpointHandlerClass = Constructor<EndpointHandler>;

export function defineHandler<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  definition: TEndpointDefinition,
  handler: EndpointHandlerFunction<TEndpointDefinition>
): Constructor<EndpointHandler> {
  class AnonymousEndpointHandler extends EndpointHandler {
    constructor() {
      super();
      this.define(definition, handler);
    }

    public get name(): string {
      return handler.name || 'AnonymousEndpointHandler';
    }
  }

  return AnonymousEndpointHandler;
}

export interface RouterIoc {
  get<T>(Class: Constructor<T>): T;
}

export interface RouterOptions {
  handlers?: EndpointHandlerClass[];
  ioc?: RouterIoc;
}

export type RouterHandleMethod = (request: Request<any, any>, response: Response<any>) => Promise<void>;

export interface UnprotectedRouter {
  readonly handle: RouterHandleMethod;
}

export class HandlerConstructorError extends Error {
  constructor(Handler: Constructor<EndpointHandler>, innerError: Error | string | any) {
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

export class Router {
  protected readonly handlerClasses: EndpointHandlerClass[] = [];
  protected handlers: EndpointHandler[] | undefined;

  private readonly ioc: RouterIoc;

  constructor(options?: RouterOptions) {
    this.ioc = (options && options.ioc) || {
      get: <T>(Class: Constructor<T>) => {
        return new Class();
      }
    };

    const handlers = (options && options.handlers) || [];
    if (handlers.length) {
      this.handlerClasses.push(...handlers);
    }
  }

  public use(handler: Constructor<EndpointHandler>, ...handlers: EndpointHandlerClass[]): this {
    this.handlerClasses.push(handler, ...handlers);
    this.handlers = undefined;
    return this;
  }

  public getHandlers(): EndpointHandler[] {
    if (!this.handlers) {
      this.handlers = this.createHandlers();
    }
    return this.handlers;
  }

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
}

declare const window: any | undefined;

warnIfWindowDetected(typeof window === 'undefined' ? undefined : window, console);
