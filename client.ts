import axios, { AxiosRequestConfig } from 'axios';

import { Empty, EndpointDefinition, IsEmptyFieldName } from './shared';

export interface Object {
  [IsEmptyFieldName]: '0';
}

// tslint:disable-next-line:ban-types
export type IfEmpty<TValue extends Object, TThen, TElse> = {
  ['1']: TThen;
  ['0']: TElse
}[TValue[typeof IsEmptyFieldName]];

export interface StrongPointClientResponse<TBody> {
  statusCode: number;
  statusText: string;
  body: TBody;
}

export interface StrongPointClientOptions {
  server?: string;
  axios?: typeof axios;
}

export type EndpointDefinitionWithNoParamsOrBody = EndpointDefinition<Empty, Empty, any>;

// tslint:disable-next-line:ban-types
export type FetchParamsOptions<TRequestParams extends Object> = IfEmpty<TRequestParams, {}, { params: TRequestParams }>;

// tslint:disable-next-line:ban-types
export type FetchBodyOptions<TRequestBody extends Object> = IfEmpty<TRequestBody, {}, { body: TRequestBody }>;

export type StrongPointClientFetchOptions<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  FetchParamsOptions<TEndpointDefinition['typeInfo']['request']['params']> &
  FetchBodyOptions<TEndpointDefinition['typeInfo']['request']['body']>
);

export type RequestWithEmptyParamsAndBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  (
    definition: TEndpointDefinition,
    options: StrongPointClientFetchOptions<TEndpointDefinition>
  ) => Promise<StrongPointClientResponse<TEndpointDefinition['typeInfo']['response']['body']>>
);

export type RequestWithParamsOrBody<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  (
    definition: TEndpointDefinition,
    options: StrongPointClientFetchOptions<TEndpointDefinition>
  ) => Promise<StrongPointClientResponse<TEndpointDefinition['typeInfo']['response']['body']>>
);

export type RequestFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  RequestWithEmptyParamsAndBody<TEndpointDefinition> |
  RequestWithParamsOrBody<TEndpointDefinition>
);

class StrongPointClient {
  private readonly axios: typeof axios;
  private readonly server: string;

  constructor(options?: StrongPointClientOptions) {
    this.axios = (options && options.axios) || axios;
    this.server = (options && options.server) || '';
  }

  public fetch<TEndpointDefinition extends EndpointDefinitionWithNoParamsOrBody>(
    definition: TEndpointDefinition,
    options?: StrongPointClientFetchOptions<TEndpointDefinition>
  ): Promise<StrongPointClientResponse<TEndpointDefinition['typeInfo']['response']['body']>>;

  public fetch<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    definition: TEndpointDefinition,
    options: StrongPointClientFetchOptions<TEndpointDefinition>
  ): Promise<StrongPointClientResponse<TEndpointDefinition['typeInfo']['response']['body']>>;

  public fetch<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  ): Promise<StrongPointClientResponse<TEndpointDefinition['typeInfo']['response']['body']>> {
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
      .then(response => {
        const result: StrongPointClientResponse<TEndpointDefinition['typeInfo']['response']['body']> = {
          statusCode: response.status,
          statusText: response.statusText,
          body: response.data
        };

        return result;
      });
  }
}

export default StrongPointClient;

// interface Product {
//   id: string;
//   name: string;
//   url: string;
// }

// declare const getProduct: EndpointDefinition<{ id: string }, Empty, Product>;
// declare const addProduct: EndpointDefinition<Empty, Product, Product>;

// const client = new StrongPointClient();
// client.fetch(getProduct, {
//   params: {
//     id: '1'
//   }
// });

// client.fetch(addProduct, {
//   body: {
//     id: '2',
//     url: 'Some new url'
//   }
// });
