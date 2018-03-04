import { EndpointContext, EndpointDefinition } from '../shared';

export class StrongPointClientResponse<TBody> {
  constructor(public readonly statusCode: number, public readonly statusMessage: string, public readonly body: TBody) {
  }
}

export class StrongPointClient {
  public async fetch<
    TDefinition extends EndpointDefinition<any, any, any>
    >(endpoint: TDefinition): Promise<StrongPointClientResponse<string>> {
    throw new Error('Not implemented');
    // return await new StrongPointClientResponse(200, 'OK', `Response for ${ endpoint.method }...`);
  }
}
