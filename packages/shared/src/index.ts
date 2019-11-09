// eslint-disable-next-line max-classes-per-file
import { createPath, PathBuildingFunction } from './pathBuilder';
import { PathHelper, PathHelperParseMatch } from './pathHelper';

export {
  Logger,
  NoopLogger,
} from './logger';
export {
  GetUrlOptions,
  PathHelperParseMatch,
  ParsedPathPattern,
  PathHelper,
  RequiredPathParametersNotFound,
  UnsupportedPathPatternError,
} from './pathHelper';
export {
  parseQueryString,
  ParsedUrl,
  parseUrl,
  QueryParameterValues,
} from './url';

export const cleanseHttpMethod = (method: string) => method.toUpperCase();

export type Constructor<T> = new (...args: any[]) => T;

export interface ArrayOfTypeInfo<T> {
  element: T;
}

export class ArrayOfClassInfo<T> {
  constructor(readonly element: Constructor<T>) {
  }
}

export abstract class ArrayOf<T> {
  static isArrayOf: true = true;

  readonly classInfo?: ArrayOfClassInfo<T>;

  constructor(Class: Constructor<T>) {
    this.classInfo = new ArrayOfClassInfo(Class);
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

export type NormalizeArrayOf<T> = T extends ArrayOf<infer TElementType> ? TElementType[] : T;

export class Empty {
  readonly __isEmpty = true;
}

export function isEmptyClass(Class: Constructor<any>): boolean {
  return Class === Empty;
}

export function isEmptyValue(value: any) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'object' && !Object.keys(value).length) {
    return true;
  }

  return false;
}

export type NormalizeTypePointType<T> =
  T extends ArrayOf<infer TElementType>
    ? TElementType[]
    : T extends Empty
      ? ({} | undefined)
      : T;

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

export interface EndpointDefinition<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
> {
  readonly method: string;

  readonly path: string;

  readonly classInfo?: EndpointDefinitionClassInfo<TRequestParams, TRequestBody, TResponseBody>;

  parse(url: string): PathHelperParseMatch | undefined;

  url(options?: EndpointDefinitionUrlOptions<TRequestParams>): string;
}

export function defineEndpoint<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
>(
  buildPath: PathBuildingFunction<TRequestParams>
): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;

export function defineEndpoint<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
>(
  method: string,
  buildPath: PathBuildingFunction<TRequestParams>
): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;

export function defineEndpoint<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
>(
  options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>
): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody>;

export function defineEndpoint<
  TRequestParams extends Record<string, any> | Empty,
  TRequestBody extends Record<string, any> | Empty,
  TResponseBody extends Record<string, any> | Empty
>(...args: any[]): EndpointDefinition<TRequestParams, TRequestBody, TResponseBody> {
  const DEFAULT_METHOD = 'GET';

  const [firstArg, secondArg] = args;

  const make = ({ classInfo, method, pathFunc }: {
    classInfo?: EndpointDefinitionClassInfo<TRequestParams, TRequestBody, TResponseBody> | undefined;
    method: string;
    pathFunc: PathBuildingFunction<TRequestParams>;
  }) => {
    const path = createPath(pathFunc);
    const pathHelper = new PathHelper(path);
    return {
      method,
      path,
      classInfo,
      parse: (url: string) => pathHelper.parse(url),
      url: (options?: EndpointDefinitionUrlOptions<TRequestParams>) => pathHelper.url(options),
    };
  };

  switch (args.length) {
    case 1: {
      if (typeof firstArg === 'object') {
        const options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> = firstArg;

        return make({
          classInfo: isClassBasedEndpointDefinitionOptions(options) ? new EndpointDefinitionClassInfo(
            options.requestParams,
            options.requestBody,
            options.responseBody,
          ) : undefined,
          method: cleanseHttpMethod(options.method || DEFAULT_METHOD),
          pathFunc: options.path,
        });
      } if (typeof firstArg === 'function') {
        return make({
          method: DEFAULT_METHOD,
          pathFunc: firstArg,
        });
      }

      throw new EndpointDefinitionInvalidConstructorArgs(args);
    }

    case 2: {
      return make({
        method: cleanseHttpMethod(firstArg || DEFAULT_METHOD),
        pathFunc: secondArg,
      });
    }

    default: {
      throw new EndpointDefinitionInvalidConstructorArgs(args);
    }
  }
}

export type GetEndpointDefinitionRequestParams<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  TEndpointDefinition extends EndpointDefinition<infer TRequestParams, any, any> ? TRequestParams : never;

export type GetEndpointDefinitionRequestBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  TEndpointDefinition extends EndpointDefinition<any, infer TRequestBody, any> ? TRequestBody : never;

export type GetEndpointDefinitionResponseBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> =
  TEndpointDefinition extends EndpointDefinition<any, any, infer TResponseBody> ? TResponseBody : never;
