import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { If } from 'typelevel-ts';

// import './shared';
import { Empty, EndpointDefinition, IsEmptyFieldName, NormalisedArrayOf } from './shared';

declare global {
  interface Object {
    [IsEmptyFieldName]: 'F';
  }
}

// tslint:disable-next-line:ban-types
export type IfEmpty<TValue extends Object | Empty, TThen, TElse> = If<TValue[typeof IsEmptyFieldName], TThen, TElse>;

export interface StrongPointClientResponse<TBody> {
  body: NormalisedArrayOf<TBody>;
  statusCode: number;
  statusText: string;
  headers: { [name: string]: string | undefined };
  header(name: string): string | undefined;
}

export interface StrongPointClientOptions {
  server?: string;
  axios?: AxiosInstance;
}

export type EndpointDefinitionWithNoParamsOrBody = EndpointDefinition<Empty, Empty, any>;

// tslint:disable-next-line:ban-types
export type FetchParamsOptions<TRequestParams extends Object> = IfEmpty<TRequestParams, {}, { params: TRequestParams }>;

// tslint:disable-next-line:ban-types
export type FetchBodyOptions<TRequestBody extends Object> = IfEmpty<TRequestBody, {}, { body: TRequestBody }>;

export type StrongPointClientFetchOptions<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  FetchParamsOptions<ReturnType<TEndpointDefinition['typeInfo']>['request']['params']> &
  FetchBodyOptions<ReturnType<TEndpointDefinition['typeInfo']>['request']['body']>
);

export type RequestWithEmptyParamsAndBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  (
    definition: TEndpointDefinition,
    options: StrongPointClientFetchOptions<TEndpointDefinition>
  ) => Promise<StrongPointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>
);

export type RequestWithParamsOrBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  (
    definition: TEndpointDefinition,
    options: StrongPointClientFetchOptions<TEndpointDefinition>
  ) => Promise<StrongPointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>
);

export type RequestFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  RequestWithEmptyParamsAndBody<TEndpointDefinition> |
  RequestWithParamsOrBody<TEndpointDefinition>
);

export class StrongPointClientResponseError extends Error {

  statusCode: number;
  statusText: string;

  constructor(
    message: string,
    public response: StrongPointClientResponse<any>
  ) {
    super(message);
    this.statusCode = response.statusCode;
    this.statusText = response.statusText;
  }
}

export class StrongPointClient {
  protected readonly axios: AxiosInstance;
  private readonly server: string;

  constructor(options?: StrongPointClientOptions) {
    this.axios = (options && options.axios) || axios.create();
    this.server = (options && options.server) || '';
  }

  fetch<TEndpointDefinition extends EndpointDefinitionWithNoParamsOrBody>(
    definition: TEndpointDefinition,
    options?: StrongPointClientFetchOptions<TEndpointDefinition>
  ): Promise<StrongPointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>;

  fetch<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    options: StrongPointClientFetchOptions<TEndpointDefinition>
  ): Promise<StrongPointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>;

  fetch<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  ): Promise<StrongPointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>> {
    const endpoint: TEndpointDefinition = arguments[0];
    const options: StrongPointClientFetchOptions<TEndpointDefinition> | undefined = (
      arguments.length > 1 ? arguments[1] : undefined
    );

    const url = endpoint.url({
      server: this.server,
      params: options && options.params
    });

    const requestOptions: AxiosRequestConfig = {
      method: endpoint.method,
      url
    };

    if (options && options.body) {
      requestOptions.data = options.body;
    }

    return this.axios.request(requestOptions)
      .then(res => {
        const response: StrongPointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']> = {
          statusCode: res.status,
          statusText: res.statusText,
          header: name => res.headers[name],
          headers: res.headers,
          body: res.data
        };

        return response;
      }, err => {
        const res = err.response;

        const response: StrongPointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']> = {
          statusCode: res.status,
          statusText: res.statusText,
          header: name => res.headers[name],
          headers: res.headers,
          body: res.data
        };

        const error = new StrongPointClientResponseError(
          err.message || `${ err }`,
          response
        );

        throw error;
      });
  }
}
