import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import {
  Empty,
  EndpointDefinition,
  GetEndpointDefinitionRequestParams,
  GetEndpointDefinitionRequestBody,
  GetEndpointDefinitionResponseBody,
  NormalizeTypePointType,
} from '@typepoint/shared';

export interface TypePointClientResponse<TBody> {
  body: NormalizeTypePointType<TBody>;
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
  TRequestParams extends Empty ? {} : { params: NormalizeTypePointType<TRequestParams> }
);

export type FetchBodyOptions<TRequestBody extends Record<string, any>> = (
  TRequestBody extends Empty ? {} : { body: NormalizeTypePointType<TRequestBody> }
);

export type TypePointClientFetchOptions<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  FetchParamsOptions<GetEndpointDefinitionRequestParams<TEndpointDefinition>> &
  FetchBodyOptions<GetEndpointDefinitionRequestBody<TEndpointDefinition>>
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

export interface FetchFunction {
  <TEndpointDefinition extends EndpointDefinitionWithNoParamsOrBody>(
    definition: TEndpointDefinition,
    options?: TypePointClientFetchOptions<TEndpointDefinition>
  ): Promise<TypePointClientResponse<GetEndpointDefinitionResponseBody<TEndpointDefinition>>>;

  <TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    options: TypePointClientFetchOptions<TEndpointDefinition>
  ): Promise<TypePointClientResponse<GetEndpointDefinitionResponseBody<TEndpointDefinition>>>;
}

export class TypePointClient {
  protected readonly axios: AxiosInstance;

  private readonly server: string;

  constructor(options?: TypePointClientOptions) {
    this.axios = (options && options.axios) || axios.create();
    this.server = (options && options.server) || '';
  }

  fetch: FetchFunction = async <TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    ...args: any[]
  ): Promise<TypePointClientResponse<GetEndpointDefinitionResponseBody<TEndpointDefinition>>> => {
    const endpoint: TEndpointDefinition = args[0];
    const options: TypePointClientFetchOptions<TEndpointDefinition> | undefined = (
      args.length > 1 ? args[1] : undefined
    );

    const url = endpoint.url({
      server: this.server,
      params: options && (options as { params: any }).params,
    });

    const requestOptions: AxiosRequestConfig = {
      method: endpoint.method as Method,
      url,
    };

    if (options && (options as { body: any }).body) {
      requestOptions.data = (options as { body: any }).body;
    }

    return this.axios.request(requestOptions)
      .then((res) => {
        const response: TypePointClientResponse<GetEndpointDefinitionResponseBody<TEndpointDefinition>> = {
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
          TypePointClientResponse<GetEndpointDefinitionResponseBody<TEndpointDefinition>> |
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
