import { Request as ExpressRequest } from 'express';
import { cleanseHttpMethod, NormalizeTypePointType } from '@typepoint/shared';
import { Request as TypePointRequest, RequestCookies, RequestHeaders } from '@typepoint/server';

export class TypePointExpressRequest<TParams, TBody> implements TypePointRequest<TParams, TBody> {
  readonly url: string;

  readonly method: string;

  params: NormalizeTypePointType<TParams>;

  body: NormalizeTypePointType<TBody>;

  readonly cookies: RequestCookies;

  readonly headers: RequestHeaders;

  readonly signedCookies: RequestCookies;

  constructor(private request: ExpressRequest) {
    this.method = cleanseHttpMethod(request.method);
    this.url = request.url;
    this.params = request.query as any;
    this.body = request.body as any;
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
      .map((key) => ({ key: normaliseHeaderName(key), value: this.headers[key] }))
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
