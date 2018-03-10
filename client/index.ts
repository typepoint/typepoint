import axios from 'axios';

import { EndpointContext, EndpointDefinition } from '../shared';

export class StrongPointClientResponse<TBody> {
  constructor(public readonly statusCode: number, public readonly statusText: string, public readonly body: TBody) {
  }
}

interface StrongPointClientOptions {
  axios: typeof axios;
}

interface StrongPointClientFetchOptions<TDefinition extends EndpointDefinition<any, any, any>> {
  host?: string;
  params?: TDefinition['context']['request']['params'];
  body?: TDefinition['context']['request']['body'];
}

class StrongPointClient {
  private readonly axios: typeof axios;

  constructor(options?: StrongPointClientOptions) {
    this.axios = (options && options.axios) || axios;
  }

  public async fetch<
    TDefinition extends EndpointDefinition<any, any, any>
    >(
      endpoint: TDefinition,
      options: StrongPointClientFetchOptions<TDefinition>
    ): Promise<StrongPointClientResponse<string>> {

    const response = await this.axios.request({
      method: endpoint.method,
      url: endpoint.path,
    });

    const result = new StrongPointClientResponse(response.status, response.statusText, response.data);

    return result;
  }
}

export default StrongPointClient;
