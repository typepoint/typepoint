import { cleanseHttpMethod, HttpMethod, HttpMethods } from './shared/http';
import { PathHelper, PathHelperParseMatch } from './shared/pathHelper';

// tslint:disable-next-line:no-reference
export const IsEmptyFieldName = '                                                        ';

export interface Empty {
  [IsEmptyFieldName]: '1';
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
  TRequestParams extends object | Empty,
  TRequestBody extends object | Empty,
  TResponseBody
  > {
  // tslint:enable:ban-types
  private pathHelper: PathHelper;

  constructor(public readonly method: HttpMethod, public readonly path: string) {
    this.method = cleanseHttpMethod(method);
    this.pathHelper = new PathHelper(path);
  }

  public get typeInfo(): EndpointDefinitionTypeInfo<TRequestParams, TRequestBody, TResponseBody> {
    throw new DoNotReferenceEndpointDefinitionTypeInfo();
  }

  public parse(url: string): PathHelperParseMatch | undefined {
    return this.pathHelper.parse(url);
  }

  public url(options?: EndpointDefinitionUrlOptions<TRequestParams>) {
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
