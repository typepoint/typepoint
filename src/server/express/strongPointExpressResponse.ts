import { Response as ExpressResponse } from 'express';
import * as httpStatusCodes from 'http-status-codes';

import { HeadersAlreadySent, Response as StrongPointResponse, ResponseHeaders, SetCookieOptions } from '../../server';

export class StrongPointExpressResponse<TResponseBody> implements StrongPointResponse<TResponseBody> {
  public get hasFlushedHeaders(): boolean {
    return this.response.headersSent;
  }

  public get hasFlushed(): boolean {
    return this.innerHasFlushedBody;
  }

  public get statusCode(): number | undefined {
    return this.innerStatusCode;
  }

  public set statusCode(value: number | undefined) {
    this.ensureHeadersNotSent();

    this.innerStatusCode = value;

    if (value) {
      this.response.statusCode = value;
    }
  }

  public get body(): TResponseBody | undefined {
    return this.innerBody;
  }

  public set body(value: TResponseBody | undefined) {
    this.ensureBodyNotSent();

    this.innerBody = value;

    if (this.statusCode === undefined) {
      this.statusCode = httpStatusCodes.OK;
    }
  }

  private innerStatusCode: number | undefined;
  private innerStatusText: string | undefined;
  private innerBody: TResponseBody | undefined;
  private innerHasFlushedBody: boolean = false;

  constructor(private response: ExpressResponse) {
  }

  public flushHeaders() {
    if (!this.response.headersSent) {
      this.response.flushHeaders();
    }
  }

  public flush() {
    if (this.body === undefined) {
      this.response.end();
    } else {
      this.response.json(this.body);
    }
    this.innerHasFlushedBody = true;
  }

  public cookie(name: string, value: string, options: SetCookieOptions): void {
    this.response.cookie(name, value, options);
  }

  public clearCookie(name: string, options: SetCookieOptions): void {
    this.response.clearCookie(name, options);
  }

  public header(name: string): string | string[] | number | undefined;
  public header(name: string, value: string | string[] | number | undefined): void;

  public header(
    name: string,
    value?: string | string[] | number | undefined
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
  }

  public headers(): ResponseHeaders {
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
