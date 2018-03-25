import { Request as ExpressRequest } from 'express';

import { Request as StrongPointRequest, RequestHeaders } from '../../server';
import { cleanseHttpMethod, HttpMethod } from '../../shared/http';

export class StrongPointExpressRequest<TParams, TBody> implements StrongPointRequest<TParams, TBody> {
  public readonly url: string;
  public readonly method: HttpMethod;
  public params: TParams;
  public readonly body: TBody;
  public readonly headers: RequestHeaders;

  constructor(private request: ExpressRequest) {
    this.method = cleanseHttpMethod(request.method);
    this.url = request.url;
    this.params = request.query;
    this.body = request.body;
    this.headers = request.headers;
  }

  public header(name: string): string | string[] | undefined {
    function normaliseHeaderName(headerName: string): string {
      return headerName.toLowerCase().replace(/\s+/gi, '-');
    }

    const normalisedHeaders = Object
      .getOwnPropertyNames(this.headers)
      .map(key => ({ key: normaliseHeaderName(key), value: this.headers[key] }))
      .reduce((accumulator, keyValue) => {
        accumulator[keyValue.key] = keyValue.value;
        return accumulator;
      }, {} as RequestHeaders);

    const normalisedHeaderName = normaliseHeaderName(name);
    const result = normalisedHeaders[normalisedHeaderName];
    return result;
  }
}
