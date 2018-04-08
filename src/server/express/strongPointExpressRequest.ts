import { Request as ExpressRequest } from 'express';

import { Request as StrongPointRequest, RequestCookies, RequestHeaders } from '../../server';
import { cleanseHttpMethod, HttpMethod } from '../../shared/http';

export class StrongPointExpressRequest<TParams, TBody> implements StrongPointRequest<TParams, TBody> {
  readonly url: string;
  readonly method: HttpMethod;
  params: TParams;
  body: TBody;
  readonly cookies: RequestCookies;
  readonly headers: RequestHeaders;
  readonly signedCookies: RequestCookies;

  constructor(private request: ExpressRequest) {
    this.method = cleanseHttpMethod(request.method);
    this.url = request.url;
    this.params = request.query;
    this.body = request.body;
    this.cookies = request.cookies;
    this.headers = request.headers;
    this.signedCookies = request.signedCookies;
  }

  cookie(name: string): string | undefined {
    return this.request.cookies[name];
  }

  header(name: string): string | string[] | undefined {
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

  signedCookie(name: string): string | undefined {
    return this.request.signedCookies[name];
  }
}
