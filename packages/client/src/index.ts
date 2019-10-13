import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Empty, EndpointDefinition, NormalisedArrayOf } from '@typepoint/shared';

export interface TypePointClientResponse<TBody> {
  body: NormalisedArrayOf<TBody>;
  statusCode: number;
  statusText: string;
  headers: { [name: string]: string | undefined };
  header(name: string): string | undefined;
}

export interface TypePointClientOptions {
  server?: string;
  axios?: AxiosInstance;
}

export type EndpointDefinitionWithNoParamsOrBody = EndpointDefinition<Empty, Empty, any>;

export type FetchParamsOptions<TRequestParams extends Record<string, any>> = (
  TRequestParams extends Empty ? {} : { params: TRequestParams }
);

export type FetchBodyOptions<TRequestBody extends Record<string, any>> = (
  TRequestBody extends Empty ? {} : { body: TRequestBody }
);

export type TypePointClientFetchOptions<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  FetchParamsOptions<ReturnType<TEndpointDefinition['typeInfo']>['request']['params']> &
  FetchBodyOptions<ReturnType<TEndpointDefinition['typeInfo']>['request']['body']>
);

export type RequestWithEmptyParamsAndBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  (
    definition: TEndpointDefinition,
    options: TypePointClientFetchOptions<TEndpointDefinition>
  ) => Promise<TypePointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>
);

export type RequestWithParamsOrBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  (
    definition: TEndpointDefinition,
    options: TypePointClientFetchOptions<TEndpointDefinition>
  ) => Promise<TypePointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>
);

export type RequestFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  RequestWithEmptyParamsAndBody<TEndpointDefinition> |
  RequestWithParamsOrBody<TEndpointDefinition>
);

export class TypePointClientResponseError extends Error {
  statusCode: number | undefined;

  statusText: string | undefined;

  constructor(
    message: string,
    public response: TypePointClientResponse<any> | undefined,
  ) {
    super(message);
    this.statusCode = response ? response.statusCode : undefined;
    this.statusText = response ? response.statusText : undefined;
  }
}

export class TypePointClient {
  protected readonly axios: AxiosInstance;

  private readonly server: string;

  constructor(options?: TypePointClientOptions) {
    this.axios = (options && options.axios) || axios.create();
    this.server = (options && options.server) || '';
  }

  fetch<TEndpointDefinition extends EndpointDefinitionWithNoParamsOrBody>(
    definition: TEndpointDefinition,
    options?: TypePointClientFetchOptions<TEndpointDefinition>
  ): Promise<TypePointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>;

  // eslint-disable-next-line no-dupe-class-members
  fetch<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    options: TypePointClientFetchOptions<TEndpointDefinition>
  ): Promise<TypePointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>>;

  // eslint-disable-next-line no-dupe-class-members
  fetch<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    ...args: any[]
  ): Promise<TypePointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']>> {
    const endpoint: TEndpointDefinition = args[0];
    const options: TypePointClientFetchOptions<TEndpointDefinition> | undefined = (
      arguments.length > 1 ? args[1] : undefined
    );

    const url = endpoint.url({
      server: this.server,
      params: options && (options as { params: any }).params,
    });

    const requestOptions: AxiosRequestConfig = {
      method: endpoint.method,
      url,
    };

    if (options && (options as { body: any }).body) {
      requestOptions.data = (options as { body: any }).body;
    }

    return this.axios.request(requestOptions)
      .then((res) => {
        const response: TypePointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']> = {
          statusCode: res.status,
          statusText: res.statusText,
          header: (name) => res.headers[name],
          headers: res.headers,
          body: res.data,
        };

        return response;
      }, (err) => {
        const res = err.response;

        const response: (
          TypePointClientResponse<ReturnType<TEndpointDefinition['typeInfo']>['response']['body']> |
          undefined
        ) = (
          res ? {
            statusCode: res.status,
            statusText: res.statusText,
            header: (name) => res.headers[name],
            headers: res.headers,
            body: res.data,
          } : undefined
        );

        const error = new TypePointClientResponseError(
          err.message || `${err}`,
          response,
        );

        throw error;
      });
  }
}
