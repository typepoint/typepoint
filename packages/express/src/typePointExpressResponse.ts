import { Response as ExpressResponse } from 'express';
import { OK } from 'http-status-codes';
import { NormalizeTypePointType } from '@typepoint/shared';
import {
  HeadersAlreadySent,
  Response as TypePointResponse,
  ResponseContentType,
  ResponseHeaders,
  SetCookieOptions,
} from '@typepoint/server';

export const isContentTypeJson = (contentType: string) => (
  (contentType || '').toLowerCase() === 'application/json'
);


export class TypePointExpressResponse<TResponseBody> implements TypePointResponse<TResponseBody> {
  get hasFlushedHeaders(): boolean {
    return this.response.headersSent;
  }

  get hasFlushed(): boolean {
    return this.innerHasFlushedBody;
  }

  get statusCode(): number | undefined {
    return this.innerStatusCode;
  }

  set statusCode(value: number | undefined) {
    this.ensureHeadersNotSent();

    this.innerStatusCode = value;

    if (value) {
      this.response.statusCode = value;
    }
  }

  get contentType(): ResponseContentType {
    return this.innerContentType;
  }

  set contentType(value: ResponseContentType) {
    this.ensureHeadersNotSent();

    this.innerContentType = value;

    if (value) {
      this.response.contentType(value);
    }
  }

  get body(): NormalizeTypePointType<TResponseBody> | undefined {
    return this.innerBody;
  }

  set body(value: NormalizeTypePointType<TResponseBody> | undefined) {
    this.ensureBodyNotSent();

    this.innerBody = value;

    if (this.statusCode === undefined) {
      this.statusCode = OK;
    }
  }

  private innerStatusCode: number | undefined;

  private innerBody: NormalizeTypePointType<TResponseBody> | undefined;

  private innerHasFlushedBody = false;

  private innerContentType: ResponseContentType = 'application/json';

  constructor(private response: ExpressResponse) {
  }

  flushHeaders() {
    if (!this.response.headersSent) {
      this.response.flushHeaders();
    }
  }

  flush() {
    if (this.body === undefined) {
      this.response.end();
    } else if (isContentTypeJson(this.contentType)) {
      this.response.json(this.body);
    } else {
      this.response.send(this.body);
    }
    this.innerHasFlushedBody = true;
  }

  cookie(name: string, value: string, options: SetCookieOptions): void {
    this.response.cookie(name, value, options);
  }

  clearCookie(name: string, options: SetCookieOptions): void {
    this.response.clearCookie(name, options);
  }

  header(name: string): string | string[] | number | undefined;

  // eslint-disable-next-line no-dupe-class-members
  header(name: string, value: string | string[] | number | undefined): void;

  // eslint-disable-next-line no-dupe-class-members
  header(
    name: string,
    value?: string | string[] | number | undefined,
  ): string | string[] | number | undefined | void {
    if (arguments.length === 1) {
      return this.response.getHeader(name);
    }
    if (this.hasFlushedHeaders) {
      throw new HeadersAlreadySent('Cannot set header');
    }
    if (value === undefined) {
      this.response.removeHeader(name);
    } else {
      this.response.setHeader(name, value);
    }
    return undefined;
  }

  headers(): ResponseHeaders {
    return this.response.getHeaders();
  }

  private ensureHeadersNotSent() {
    if (this.response.headersSent) {
      throw new HeadersAlreadySent();
    }
  }

  private ensureBodyNotSent() {
    if (this.response.headersSent) {
      throw new HeadersAlreadySent();
    }
  }
}
