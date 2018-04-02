import { argumentsToArray } from './shared/functions';
import { cleanseHttpMethod, HttpMethod, HttpMethods } from './shared/http';
import { PathHelper, PathHelperParseMatch } from './shared/pathHelper';

export interface Constructor<T> {
  new(...args: any[]): T;
}

export const IsEmptyFieldName = ' isEmpty ';

export class Empty {
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

export interface BaseEndpointDefinitionOptions<
  // tslint:disable:ban-types
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody extends Object | Empty
  // tslint:enable:ban-types
  > {

  method?: string;
  path: string;

}

export interface ClassBasedEndpointDefinitionOptions<
  // tslint:disable:ban-types
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody extends Object | Empty
  // tslint:enable:ban-types
  > extends BaseEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> {

  requestParams: Constructor<TRequestParams>;
  requestBody: Constructor<TRequestBody>;
  responseBody: Constructor<TResponseBody>;

}

export type EndpointDefinitionOptions<
  // tslint:disable:ban-types
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody extends Object | Empty
  // tslint:enable:ban-types
  > = (
    BaseEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> |
    ClassBasedEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>
  );

function isClassBasedEndpointDefinitionOptions<
  // tslint:disable:ban-types
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody extends Object | Empty
  // tslint:enable:ban-types
  >(
    options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>
  ): options is ClassBasedEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> {

  const partialOptions = options as
    Partial<ClassBasedEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>>;

  return !!(
    partialOptions.requestParams &&
    partialOptions.requestBody &&
    partialOptions.responseBody
  );
}

export class EndpointDefinitionRequestClassInfo<TParams, TBody> {
  constructor(
    readonly params: Constructor<TParams>,
    readonly body: Constructor<TBody>
  ) {
  }
}

export class EndpointDefinitionResponseClassInfo<TBody> {
  constructor(
    readonly body: Constructor<TBody>
  ) {
  }
}

export class EndpointDefinitionClassInfo<
  // tslint:disable:ban-types
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody
  // tslint:enable:ban-types
  > {

  readonly request: EndpointDefinitionRequestClassInfo<TRequestParams, TRequestBody>;
  readonly response: EndpointDefinitionResponseClassInfo<TResponseBody>;

  constructor(
    requestParams: Constructor<TRequestParams>,
    requestBody: Constructor<TRequestBody>,
    responseBody: Constructor<TResponseBody>
  ) {
    this.request = new EndpointDefinitionRequestClassInfo(requestParams, requestBody);
    this.response = new EndpointDefinitionResponseClassInfo(responseBody);
  }
}

export class EndpointDefinitionInvalidConstructorArgs extends Error {
  constructor(actualArguments: IArguments) {
    const received = (
      !actualArguments.length ?
        'zero arguments' :
        argumentsToArray(actualArguments).map(arg => typeof arg).join(', ')
    );
    super(`Invalid EndpointDefinition constructor arguments - received ${ arguments.length } arguments: ${ received }`);
  }
}

export class EndpointDefinition<
  // tslint:disable:ban-types
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody extends Object | Empty
  > {
  readonly method: HttpMethod;
  readonly path: string;
  readonly classInfo?: EndpointDefinitionClassInfo<TRequestParams, TRequestBody, TResponseBody>;

  // tslint:enable:ban-types
  private pathHelper: PathHelper;

  constructor(path: string);
  constructor(method: HttpMethod, path: string);
  // tslint:disable-next-line:unified-signatures
  constructor(options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>);

  constructor() {
    const DEFAULT_METHOD: HttpMethod = 'GET';

    switch (arguments.length) {
      case 1: {
        if (typeof arguments[0] === 'object') {
          const options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> = arguments[0];

          this.method = cleanseHttpMethod(options.method || DEFAULT_METHOD);
          this.path = options.path;
          this.pathHelper = new PathHelper(this.path);

          if (isClassBasedEndpointDefinitionOptions(options)) {
            this.classInfo = new EndpointDefinitionClassInfo(
              options.requestParams,
              options.requestBody,
              options.responseBody
            );
          }
        } else if (typeof arguments[0] === 'string') {
          this.method = DEFAULT_METHOD;
          this.path = arguments[0];
          this.pathHelper = new PathHelper(this.path);
        } else {
          throw new EndpointDefinitionInvalidConstructorArgs(arguments);
        }
        break;
      }

      case 2: {
        this.method = cleanseHttpMethod(arguments[0]);
        this.path = arguments[1];
        this.pathHelper = new PathHelper(this.path);
        break;
      }

      default: {
        throw new EndpointDefinitionInvalidConstructorArgs(arguments);
      }
    }
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

// export function defineEndpoint<TRequestParams, TRequestBody, TResponseBody>(
//   path: string
// ): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;

// export function defineEndpoint<TRequestParams, TRequestBody, TResponseBody>(
//   method: HttpMethod,
//   path: string
// ): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;

// export function defineEndpoint<TRequestParams, TRequestBody, TResponseBody>(
//   // tslint:disable-next-line:unified-signatures
//   options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>
// ): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;

// export function defineEndpoint<TRequestParams, TRequestBody, TResponseBody>() {
//   return new EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>(arguments);
// }
