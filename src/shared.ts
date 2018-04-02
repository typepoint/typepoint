import { cleanseHttpMethod, HttpMethod, HttpMethods } from './shared/http';
import { PathHelper, PathHelperParseMatch } from './shared/pathHelper';

export interface Constructor<T> {
  new(...args: any[]): T;
}

export const IsEmptyFieldName = ' isEmpty ';

export interface Empty {
  [IsEmptyFieldName]: 'T';
}

export class DoNotReferenceEndpointDefinitionTypeInfo extends Error {
  constructor() {
    super('Do not evaluate definition.typeInfo. It is reserved for internal use only.');
  }
}

export interface EndpointDefinitionRequestTypeInfo<TParams, TBody> {
  params: TParams;
  body: TBody;
}

export interface EndpointDefinitionResponseTypeInfo<TBody> {
  body: TBody;
}

export interface EndpointDefinitionTypeInfo<TRequestParams, TRequestBody, TResponseBody> {
  request: EndpointDefinitionRequestTypeInfo<TRequestParams, TRequestBody>;
  response: EndpointDefinitionResponseTypeInfo<TResponseBody>;
}

export interface EndpointDefinitionUrlOptions<TRequestParams> {
  server?: string | undefined;
  params?: TRequestParams | undefined;
}

// tslint:disable:ban-types
export class EndpointDefinition<
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody
  > {
  // tslint:enable:ban-types
  private pathHelper: PathHelper;

  constructor(readonly method: HttpMethod, readonly path: string) {
    this.method = cleanseHttpMethod(method);
    this.pathHelper = new PathHelper(path);
  }

  get typeInfo(): EndpointDefinitionTypeInfo<TRequestParams, TRequestBody, TResponseBody> {
    throw new DoNotReferenceEndpointDefinitionTypeInfo();
  }

  parse(url: string): PathHelperParseMatch | undefined {
    return this.pathHelper.parse(url);
  }

  url(options?: EndpointDefinitionUrlOptions<TRequestParams>) {
    const result = this.pathHelper.url(options);
    return result;
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
