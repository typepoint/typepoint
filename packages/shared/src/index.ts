// eslint-disable-next-line max-classes-per-file
import { cleanseHttpMethod, HttpMethod } from './http';
import { createPath, PathBuildingFunction } from './pathBuilder';
import { PathHelper, PathHelperParseMatch } from './pathHelper';

export { HttpMethod } from './http';
export { PathHelper, PathHelperParseMatch } from './pathHelper';

export type Constructor<T> = new (...args: any[]) => T;

export interface ArrayOfTypeInfo<T> {
  element: T;
}

export class ArrayOfClassInfo<T> {
  constructor(readonly element: Constructor<T>) {
  }
}

export class DoNotReferenceTypeInfo extends Error {
  constructor(name: string) {
    super(`Do not evaluate ${name}.typeInfo(). It is reserved for internal use only.`);
  }
}

export abstract class ArrayOf<T> {
  static isArrayOf: true = true;

  readonly classInfo?: ArrayOfClassInfo<T>;

  constructor(Class: Constructor<T>) {
    this.classInfo = new ArrayOfClassInfo(Class);
  }

  typeInfo = (): ArrayOfTypeInfo<T> => {
    throw new DoNotReferenceTypeInfo('ArrayOf');
  }
}

export function arrayOf<T>(Class: Constructor<T>): Constructor<ArrayOf<T>> {
  class AnonymousArrayOf extends ArrayOf<T> {
    constructor() {
      super(Class);
    }
  }

  return AnonymousArrayOf;
}

export function isArrayOf<T>(Class: Constructor<any>): Class is Constructor<ArrayOf<any>> {
  return !!(Class && (Class as any).isArrayOf);
}

export type NormalisedArrayOf<T> = T extends ArrayOf<infer TElementType> ? TElementType[] : T;

export class Empty {
}

export interface EndpointDefinitionRequestTypeInfo<TParams, TBody> {
  params: NormalisedArrayOf<TParams>;
  body: NormalisedArrayOf<TBody>;
}

export interface EndpointDefinitionResponseTypeInfo<TBody> {
  body: NormalisedArrayOf<TBody>;
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
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
> {

  method?: string;
  path: PathBuildingFunction<TRequestParams>;

}

export interface ClassBasedEndpointDefinitionOptions<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
> extends BaseEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> {

  requestParams: Constructor<TRequestParams>;
  requestBody: Constructor<TRequestBody>;
  responseBody: Constructor<TResponseBody>;
}

export type EndpointDefinitionOptions<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
> = (
  BaseEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> |
  ClassBasedEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>
);

function isClassBasedEndpointDefinitionOptions<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
>(
  options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>,
): options is ClassBasedEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> {
  const partialOptions = options as
    Partial<ClassBasedEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>>;

  return !!(
    partialOptions.requestParams
    && partialOptions.requestBody
    && partialOptions.responseBody
  );
}

export class EndpointDefinitionRequestClassInfo<TParams, TBody> {
  constructor(
    readonly params: Constructor<TParams>,
    readonly body: Constructor<TBody>,
  ) {
  }
}

export class EndpointDefinitionResponseClassInfo<TBody> {
  constructor(
    readonly body: Constructor<TBody>,
  ) {
  }
}

export class EndpointDefinitionClassInfo<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody
> {
  readonly request: EndpointDefinitionRequestClassInfo<TRequestParams, TRequestBody>;

  readonly response: EndpointDefinitionResponseClassInfo<TResponseBody>;

  constructor(
    requestParams: Constructor<TRequestParams>,
    requestBody: Constructor<TRequestBody>,
    responseBody: Constructor<TResponseBody>,
  ) {
    this.request = new EndpointDefinitionRequestClassInfo(requestParams, requestBody);
    this.response = new EndpointDefinitionResponseClassInfo(responseBody);
  }
}

export class EndpointDefinitionInvalidConstructorArgs extends Error {
  constructor(actualArgs: any[]) {
    const received = (
      !actualArgs.length
        ? 'zero arguments'
        : actualArgs.map((arg) => typeof arg).join(', ')
    );
    super(`Invalid EndpointDefinition constructor arguments - received ${actualArgs.length} arguments: ${received}`);
  }
}

export class EndpointDefinition<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
> {
  readonly method: HttpMethod;

  readonly path: string;

  readonly classInfo?: EndpointDefinitionClassInfo<TRequestParams, TRequestBody, TResponseBody>;

  private pathHelper: PathHelper;

  constructor(buildPath: PathBuildingFunction<TRequestParams>);

  // eslint-disable-next-line no-dupe-class-members
  constructor(method: HttpMethod, buildPath: PathBuildingFunction<TRequestParams>);

  // eslint-disable-next-line no-dupe-class-members
  constructor(options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>);

  // eslint-disable-next-line no-dupe-class-members
  constructor(...args: any[]) {
    const DEFAULT_METHOD: HttpMethod = 'GET';

    switch (args.length) {
      case 1: {
        if (typeof args[0] === 'object') {
          const options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> = args[0];

          this.method = cleanseHttpMethod(options.method || DEFAULT_METHOD);
          this.path = createPath(options.path);
          this.pathHelper = new PathHelper(this.path);

          if (isClassBasedEndpointDefinitionOptions(options)) {
            this.classInfo = new EndpointDefinitionClassInfo(
              options.requestParams,
              options.requestBody,
              options.responseBody,
            );
          }
        } else if (typeof args[0] === 'function') {
          this.method = DEFAULT_METHOD;
          this.path = createPath(args[0]);
          this.pathHelper = new PathHelper(this.path);
        } else {
          throw new EndpointDefinitionInvalidConstructorArgs(args);
        }
        break;
      }

      case 2: {
        this.method = cleanseHttpMethod(args[0]);
        this.path = createPath(args[1]);
        this.pathHelper = new PathHelper(this.path);
        break;
      }

      default: {
        throw new EndpointDefinitionInvalidConstructorArgs(args);
      }
    }
  }

  typeInfo = (): EndpointDefinitionTypeInfo<TRequestParams, TRequestBody, TResponseBody> => {
    throw new DoNotReferenceTypeInfo('EndpointDefinition');
  }

  parse(url: string): PathHelperParseMatch | undefined {
    return this.pathHelper.parse(url);
  }

  url(options?: EndpointDefinitionUrlOptions<TRequestParams>) {
    const result = this.pathHelper.url(options);
    return result;
  }
}

export type GetEndpointDefinitionRequestParams<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  ReturnType<TEndpointDefinition['typeInfo']>['request']['params'];

export type GetEndpointDefinitionRequestBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  ReturnType<TEndpointDefinition['typeInfo']>['request']['body'];

export type GetEndpointDefinitionResponseBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  ReturnType<TEndpointDefinition['typeInfo']>['response']['body'];
