import { Request as ExpressRequest } from 'express';

import { Request as StrongPointRequest } from '../../server';
import { cleanseHttpMethod, HttpMethod } from '../../shared/http';

export class StrongPointExpressRequest<TParams, TBody> implements StrongPointRequest<TParams, TBody> {
  public readonly url: string;
  public readonly method: HttpMethod;
  public params: TParams;
  public readonly body: TBody;

  constructor(private request: ExpressRequest) {
    this.method = cleanseHttpMethod(request.method);
    this.url = request.url;
    this.params = request.query;
    this.body = request.body;
  }
}
