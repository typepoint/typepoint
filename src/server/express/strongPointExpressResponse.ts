import { Response as ExpressResponse } from 'express';
import * as httpStatusCodes from 'http-status-codes';

import { HeadersAlreadySent, Response as StrongPointResponse, ResponseHeaders } from '../../server';

function createResponseHeadersWrapper(response: ExpressResponse): ResponseHeaders {
  const remove = (name: string) => response.removeHeader(name);

  const get = (name: string) => response.get(name);

  const set = (name: string, value: string | undefined) => {
    if (value === undefined) {
      remove(name);
    } else {
      response.set(name, value);
    }
  };

  function getOrSetHeader(name: string, value?: string | undefined) {
    if (arguments.length === 2) {
      set(name, value);
    } else {
      return get(name);
    }
  }

  const result = getOrSetHeader as ResponseHeaders;

  result.get = get;
  result.set = set;
  result.remove = remove;

  return result;
}

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

  public readonly headers = createResponseHeadersWrapper(this.response);

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
