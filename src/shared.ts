import { If } from 'typelevel-ts';

import { argumentsToArray } from './shared/functions';
import { cleanseHttpMethod, HttpMethod, HttpMethods } from './shared/http';
import { createPath, PathBuildingFunction } from './shared/pathBuilder';
import { PathHelper, PathHelperParseMatch } from './shared/pathHelper';

export interface Constructor<T> {
  new(...args: any[]): T;
}

export const IsEmptyFieldName = ' isEmpty ';

export class Empty {
  [IsEmptyFieldName]: 'T';
}

export interface ArrayOfTypeInfo<T> {
  element: T;
}

export class ArrayOfClassInfo<T> {
  constructor(readonly element: Constructor<T>) {
  }
}

export class DoNotReferenceTypeInfo extends Error {
  constructor(name: string) {
    super(`Do not evaluate ${ name }.typeInfo(). It is reserved for internal use only.`);
  }
}

export abstract class ArrayOf<T> {
  static isArrayOf: true = true;

  readonly classInfo?: ArrayOfClassInfo<T>;

  constructor(Class: Constructor<T>) {
    this.classInfo = new ArrayOfClassInfo(Class);
  }

  typeInfo(): ArrayOfTypeInfo<T> {
    throw new DoNotReferenceTypeInfo('ArrayOf');
  }
}

export function arrayOf<T>(Class: Constructor<T>): Constructor<ArrayOf<T>> {
  class AnonymousArrayOf extends ArrayOf<T> {
    static isArrayOf: true = true;

    constructor() {
      super(Class);
    }
  }

  return AnonymousArrayOf;
}

export function isArrayOf<T>(Class: Constructor<any>): Class is Constructor<ArrayOf<any>> {
  return !!(Class && (Class as any).isArrayOf);
}

export type NormalisedArrayOf<T> = T extends ArrayOf<any> ? Array<ReturnType<T['typeInfo']>['element']> : T;

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
  // tslint:disable:ban-types
  TRequestParams extends Object | Empty,
  TRequestBody extends Object | Empty,
  TResponseBody extends Object | Empty
  // tslint:enable:ban-types
  > {

  method?: string;
  path: PathBuildingFunction<TRequestParams>;

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

  constructor(buildPath: PathBuildingFunction<TRequestParams>);
  constructor(method: HttpMethod, buildPath: PathBuildingFunction<TRequestParams>);
  // tslint:disable-next-line:unified-signatures
  constructor(options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody>);

  constructor() {
    const DEFAULT_METHOD: HttpMethod = 'GET';

    switch (arguments.length) {
      case 1: {
        if (typeof arguments[0] === 'object') {
          const options: EndpointDefinitionOptions<TRequestParams, TRequestBody, TResponseBody> = arguments[0];

          this.method = cleanseHttpMethod(options.method || DEFAULT_METHOD);
          this.path = createPath(options.path).toString();
          this.pathHelper = new PathHelper(this.path);

          if (isClassBasedEndpointDefinitionOptions(options)) {
            this.classInfo = new EndpointDefinitionClassInfo(
              options.requestParams,
              options.requestBody,
              options.responseBody
            );
          }
        } else if (typeof arguments[0] === 'function') {
          this.method = DEFAULT_METHOD;
          this.path = createPath(arguments[0]).toString();
          this.pathHelper = new PathHelper(this.path);
        } else {
          throw new EndpointDefinitionInvalidConstructorArgs(arguments);
        }
        break;
      }

      case 2: {
        this.method = cleanseHttpMethod(arguments[0]);
        this.path = createPath(arguments[1]).toString();
        this.pathHelper = new PathHelper(this.path);
        break;
      }

      default: {
        throw new EndpointDefinitionInvalidConstructorArgs(arguments);
      }
    }
  }

  typeInfo(): EndpointDefinitionTypeInfo<TRequestParams, TRequestBody, TResponseBody> {
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
