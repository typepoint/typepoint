import {
  EndpointDefinition,
  GetEndpointDefinitionRequestParams,
  GetEndpointDefinitionRequestBody,
  GetEndpointDefinitionResponseBody,
  NormalizeTypePointType,
  PathHelperParseMatch,
} from '@typepoint/shared';

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
  readonly method: string;
  readonly url: string;
  params: NormalizeTypePointType<TRequestParams>;
  body: NormalizeTypePointType<TRequestBody>;
  readonly cookies: RequestCookies;
  readonly headers: RequestHeaders;
  readonly signedCookies: RequestCookies;
  cookie(name: string): string | undefined;
  header(name: string): string | string[] | undefined;
  signedCookie(name: string): string | undefined;
}

export interface ResponseHeaders {
  [name: string]: string | string[] | number | undefined;
}

export interface SetCookieOptions {
  maxAge?: number;
  signed?: boolean;
  expires?: Date;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  secure?: boolean;
  encode?: (val: string) => string;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}

export type ResponseContentType = 'application/json' | string;

export interface Response<TResponseBody> {
  statusCode: number | undefined;
  contentType: ResponseContentType;
  body: NormalizeTypePointType<TResponseBody> | undefined;

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

// Use Interface Merging to add your own custom fields to the `EndpointContextMetadata` declaration
// and implement and use your own middleware to actually add the fields to `context.meta`

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EndpointContextMetadata {
}

export interface EndpointContext<
  TRequestParams,
  TRequestBody,
  TResponseBody,
  TEndpointContextMetadata = EndpointContextMetadata
> {
  meta: TEndpointContextMetadata & EndpointContextMetadata;
  request: Request<TRequestParams, TRequestBody>;
  response: Response<TResponseBody>;
}

export type EndpointContextFromDefinition<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  EndpointContext<
  GetEndpointDefinitionRequestParams<TEndpointDefinition>,
  GetEndpointDefinitionRequestBody<TEndpointDefinition>,
  GetEndpointDefinitionResponseBody<TEndpointDefinition>
  >;

export type EndpointHandlerFunctionFromDefinition<
  TEndpointDefinition extends EndpointDefinition<any, any, any>,
  TEndpointContextMetadata = EndpointContextMetadata,
> =
  (
    context: EndpointContext<
    GetEndpointDefinitionRequestParams<TEndpointDefinition>,
    GetEndpointDefinitionRequestBody<TEndpointDefinition>,
    GetEndpointDefinitionResponseBody<TEndpointDefinition>,
    TEndpointContextMetadata
    >,
    next: () => Promise<void>
  ) => Promise<void> | void;

export interface EndpointMiddleware {
  name: string;
  handle(context: EndpointContext<any, any, any>, next: () => Promise<void>): Promise<void> | void;
}

export interface EndpointHandler extends EndpointMiddleware {
  definition: EndpointDefinition<any, any, any>;
  match: (request: { method: string; url: string }) => PathHelperParseMatch | undefined;
}

export const hasDefinition = (
  handler: EndpointMiddleware | EndpointHandler,
): handler is EndpointHandler => 'definition' in handler;
