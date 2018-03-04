import { cleanseHttpMethod, HttpMethod, HttpMethods } from './shared/http';

export interface Request<TRequestParams, TRequestBody> {
  params: TRequestParams;
  body: TRequestBody;
}

export interface Response<TResponseBody> {
  body: TResponseBody;
}

export interface EndpointContext<TRequestParams, TRequestBody, TResponseBody> {
  request: Request<TRequestParams, TRequestBody>;
  response: Response<TResponseBody>;
}

export class DoNotReferenceEndpointDefinitionContext extends Error {
  constructor() {
    super(
      'Do not call definition.context directly. ' +
      'It is only used for internal use only.'
    );
  }
}

export class EndpointDefinition<TRequestParams, TRequestBody, TResponseBody> {
  constructor(public readonly method: HttpMethod, public readonly path: string) {
    this.method = cleanseHttpMethod(method);
    if (!HttpMethods.some(supportedMethod => supportedMethod === method)) {
      throw new Error(`Unsupported HTTP method: ${ method }`);
    }
  }

  get context(): EndpointContext<TRequestParams, TRequestBody, TResponseBody> {
    throw new DoNotReferenceEndpointDefinitionContext();
  }
}

export function defineEndpoint<TRequestParams, TRequestBody, TResponseBody>(
  path: string
): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;
export function defineEndpoint<TRequestParams, TRequestBody, TResponseBody>(
  method: HttpMethod,
  path: string
): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;

export function defineEndpoint<TRequestParams, TRequestBody, TResponseBody>() {
  const [method, path] = (
    arguments.length === 1 ?
      ['GET', arguments[0]] :
      [arguments[0], arguments[1]]
  );
  return new EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>(method, path);
}
