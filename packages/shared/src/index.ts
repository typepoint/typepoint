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
  // eslint-disable-next-line no-empty-function
  constructor(readonly element: Constructor<T>) {
  }
}

export abstract class ArrayOf<T> {
  static readonly isArrayOf = true as const;

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

export function isArrayOf(Class: any): Class is Constructor<ArrayOf<any>> {
  if (!Class) {
    return false;
  }
  return Boolean((Class as any).isArrayOf);
}

export type NormalizeArrayOf<T> = T extends ArrayOf<infer TElementType> ? TElementType[] : T;

export class Empty {
  // istanbul ignore next
  readonly __isEmpty = true;
}

export function isEmptyClass(Class: any): boolean {
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

export type NormalizeDefinitionType<T> = (
  T extends Array<Constructor<infer TInstance>>
    ? TInstance[]
    : T extends Constructor<infer TInstance>
      ? TInstance
      : T extends ArrayOf<infer TElementType>
        ? TElementType[]
        : T extends [infer TElementType]
          ? TElementType
          : T
);

function normalizeDefinitionType<T>(value: T): NormalizeDefinitionType<T> {
  return value as unknown as NormalizeDefinitionType<T>;
}

export type NormalizeTypePointType<T> = (
  T extends ArrayOf<infer TElementType>
    ? TElementType[]
    : T extends Empty
      // TODO: Revisit this {} type
      // eslint-disable-next-line @typescript-eslint/ban-types
      ? ({} | undefined)
      : T
);

export type AllowableRequestParams = Empty | Record<string, any>;
export type AllowableRequestBody = Empty | Record<string, any> | Array<any>;
export type AllowableResponseBody = Empty | Record<string, any> | Array<any>;

export type AllowableClassBasedRequestParams = Empty | Constructor<any>;
export type AllowableClassBasedRequestBody = Empty | Constructor<any> | Constructor<any>[];
export type AllowableClassBasedResponseBody = Empty | Constructor<any> | Constructor<any>[];

export interface EndpointDefinitionUrlOptions<TRequestParams> {
  server?: string | undefined;
  params?: NormalizeDefinitionType<TRequestParams> | undefined;
}

export type DeprecationInfo = {
  at?: Date
  endOfLife?: Date
  message: string
}

export type EndpointOptions = {
  deprecated?: DeprecationInfo
}

export interface ClassBasedEndpointDefinitionOptions<
  TRequestParams extends AllowableClassBasedRequestParams,
  TRequestBody extends AllowableClassBasedRequestBody,
  TResponseBody extends AllowableClassBasedResponseBody
> extends EndpointOptions {
  method?: string;
  path: PathBuildingFunction<NormalizeDefinitionType<TRequestParams>>;
  requestParams?: TRequestParams;
  requestBody?: TRequestBody;
  responseBody?: TResponseBody;
}

export class EndpointDefinitionRequestClassInfo<TParams, TBody> {
  constructor(
    readonly params: Constructor<TParams>,
    readonly body: Constructor<TBody> | [any],
  // eslint-disable-next-line no-empty-function
  ) {
  }
}

export class EndpointDefinitionResponseClassInfo<TBody> {
  constructor(
    readonly body: Constructor<TBody> | [any],
  // eslint-disable-next-line no-empty-function
  ) {
  }
}

export class EndpointDefinitionClassInfo {
  readonly request: EndpointDefinitionRequestClassInfo<any, any>;

  readonly response: EndpointDefinitionResponseClassInfo<any>;

  constructor(
    requestParams: Constructor<any>,
    requestBody: Constructor<any> | [any],
    responseBody: Constructor<any> | [any],
  ) {
    this.request = new EndpointDefinitionRequestClassInfo<any, any>(requestParams, requestBody);
    this.response = new EndpointDefinitionResponseClassInfo<any>(responseBody);
  }
}

export class EndpointDefinitionInvalidConstructorArgs extends Error {
  constructor(actualArgs: any[]) {
    const received = (
      !actualArgs.length
        ? 'zero arguments'
        : actualArgs.map((arg) => typeof arg).join(', ')
    );
    // istanbul ignore next - typescript creates a branch for super calls
    super(`Invalid EndpointDefinition constructor arguments - received ${actualArgs.length} arguments: ${received}`);
  }
}

export interface EndpointDefinition<
  TRequestParams extends AllowableRequestParams,
  TRequestBody extends AllowableRequestBody,
  TResponseBody extends AllowableResponseBody
> {
  readonly method: string;

  readonly path: string;

  readonly classInfo?: EndpointDefinitionClassInfo | undefined;

  parse(url: string): PathHelperParseMatch | undefined;

  url(options?: EndpointDefinitionUrlOptions<TRequestParams> | undefined): string;

  readonly deprecated?: DeprecationInfo
}

export type AnyEndpointDefinition = EndpointDefinition<any, any, any>;

export function defineEndpoint<
  TRequestParams extends AllowableRequestParams,
  TRequestBody extends AllowableRequestBody,
  TResponseBody extends AllowableResponseBody
>(
  buildPath: PathBuildingFunction<TRequestParams>,
  options?: EndpointOptions
): EndpointDefinition<
NormalizeDefinitionType<TRequestParams>,
NormalizeDefinitionType<TRequestBody>,
NormalizeDefinitionType<TResponseBody>
>;

export function defineEndpoint<
  TRequestParams extends AllowableRequestParams = Empty,
  TRequestBody extends AllowableRequestBody = Empty,
  TResponseBody extends AllowableResponseBody = Empty,
>(
  method: string,
  buildPath: PathBuildingFunction<TRequestParams>,
  options?: EndpointOptions
): EndpointDefinition<
NormalizeDefinitionType<TRequestParams>,
NormalizeDefinitionType<TRequestBody>,
NormalizeDefinitionType<TResponseBody>
>;

export function defineEndpoint<
  TRequestParams extends AllowableClassBasedRequestParams = Empty,
  TRequestBody extends AllowableClassBasedRequestBody = Empty,
  TResponseBody extends AllowableClassBasedResponseBody = Empty,
>(
  options: ClassBasedEndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>,
): EndpointDefinition<
NormalizeDefinitionType<TRequestParams>,
NormalizeDefinitionType<TRequestBody>,
NormalizeDefinitionType<TResponseBody>
>;

export function defineEndpoint<
  TRequestParams extends AllowableRequestParams,
  TRequestBody extends AllowableRequestBody,
  TResponseBody extends AllowableResponseBody,
>(...args: any[]): EndpointDefinition<
NormalizeDefinitionType<TRequestParams>,
NormalizeDefinitionType<TRequestBody>,
NormalizeDefinitionType<TResponseBody>
> {
  const DEFAULT_METHOD = 'GET';

  const make = ({
    classInfo, method, pathFunc, options,
  }: {
    classInfo?: EndpointDefinitionClassInfo | undefined;
    method: string;
    pathFunc: PathBuildingFunction<NormalizeDefinitionType<TRequestParams>>;
    options: EndpointOptions
  }) => {
    const path = createPath(pathFunc);
    const pathHelper = new PathHelper(path);
    return {
      method,
      path,
      classInfo,
      parse: (url: string) => pathHelper.parse(url),
      url: (urlOptions?: EndpointDefinitionUrlOptions<NormalizeDefinitionType<TRequestParams>>) => pathHelper.url(urlOptions),
      deprecated: options.deprecated,
    };
  };

  switch (args.length) {
    case 1: {
      const [firstArg] = args;
      if (typeof firstArg === 'function') {
        return make({
          method: DEFAULT_METHOD,
          pathFunc: firstArg,
          options: {},
        });
      }

      if (firstArg && typeof firstArg === 'object') {
        const classInfo = new EndpointDefinitionClassInfo(
          normalizeDefinitionType(firstArg.requestParams || Empty),
          normalizeDefinitionType(firstArg.requestBody || Empty),
          normalizeDefinitionType(firstArg.responseBody || Empty),
        );

        return make({
          classInfo,
          method: cleanseHttpMethod(firstArg.method || DEFAULT_METHOD),
          pathFunc: firstArg.path,
          options: { deprecated: firstArg.deprecated },
        });
      }

      throw new EndpointDefinitionInvalidConstructorArgs(args);
    }

    case 2: {
      const [method, pathFunc] = args;
      if (typeof method !== 'string' || typeof pathFunc !== 'function') {
        throw new EndpointDefinitionInvalidConstructorArgs(args);
      }

      return make({
        method: cleanseHttpMethod(method || DEFAULT_METHOD),
        pathFunc,
        options: {},
      });
    }

    case 3: {
      const [method, pathFunc, options] = args;
      if (typeof method !== 'string' || typeof pathFunc !== 'function') {
        throw new EndpointDefinitionInvalidConstructorArgs(args);
      }

      return make({
        method: cleanseHttpMethod(method || DEFAULT_METHOD),
        pathFunc,
        options,
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
