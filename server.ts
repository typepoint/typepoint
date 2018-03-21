import global = require('global');
import { warnIfWindowDetected } from './server/clientDetection';
import { EndpointDefinition } from './shared';
import { Constructor } from './shared/constructor';
import { HttpMethod } from './shared/http';
import { PathHelper, PathHelperParseMatch } from './shared/pathHelper';

export interface Request<TRequestParams, TRequestBody> {
  readonly method: HttpMethod;
  readonly url: string;
  params: TRequestParams;
  readonly body: TRequestBody;
}

export class HeadersAlreadySent extends Error {
  constructor(message?: string) {
    let fullMessage = message ? message + ' - ' : '';
    fullMessage += 'Headers have already been sent';
    super(fullMessage);
  }
}

export interface ResponseHeaders {
  (name: string): string | undefined;
  (name: string, value: string | undefined): void;

  get(name: string): string | undefined;
  set(name: string, value: string | undefined): void;
  remove(name: string): void;
}

export interface Response<TResponseBody> {
  statusCode: number | undefined;

  readonly headers: ResponseHeaders;

  body: TResponseBody | undefined;

  readonly hasFlushedHeaders: boolean;
  readonly hasFlushed: boolean;

  flush(): void;
  flushHeaders(): void;
}

export interface EndpointContext<TRequestParams, TRequestBody, TResponseBody> {
  request: Request<TRequestParams, TRequestBody>;
  response: Response<TResponseBody>;
}

type EndpointHandlerFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
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

function handleEndpoint<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  definition: TEndpointDefinition,
  handler: EndpointHandlerFunction<TEndpointDefinition>
): Constructor<EndpointHandler> {
  class AnonymousEndpointHandler extends EndpointHandler {
    constructor() {
      super();
      this.define(definition, handler);
    }
  }

  return AnonymousEndpointHandler;
}

interface RouterIoc {
  get<T>(Class: Constructor<T>): T;
}

interface RouterOptions {
  handlers?: EndpointHandlerClass[];
  ioc?: RouterIoc;
}

export type RouterHandleMethod = (request: Request<any, any>, response: Response<any>) => Promise<void>;

export interface UnprotectedRouter {
  readonly handle: RouterHandleMethod;
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

  private createHandlers(): EndpointHandler[] {
    const result: EndpointHandler[] = this.handlerClasses.map(Handler => {
      const handler = this.ioc.get(Handler);
      return handler;
    });
    return result;
  }
}

warnIfWindowDetected(global, global.console);
