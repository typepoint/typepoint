import { Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { EndpointContextMetadata, EndpointContext } from '@typepoint/server';
import { Logger, NoopLogger } from '@typepoint/shared';
import { TypePointExpressRequest } from './typePointExpressRequest';
import { TypePointExpressResponse } from './typePointExpressResponse';

export function createContext(req: Request, res: Response): EndpointContext<any, any, any> {
  const meta: EndpointContextMetadata = {};
  const endpoint = undefined;
  const request = new TypePointExpressRequest(req);
  const response = new TypePointExpressResponse(res);
  return {
    meta,
    endpoint,
    request,
    response,
  };
}

export function trySendInternalServerError(res: Response, err: Error | string | any) {
  if (!res.headersSent) {
    res.statusCode = INTERNAL_SERVER_ERROR;
    res.json((err && err.message) || err);
    res.end();
  }
}

export function getLogger(options?: { logger?: Logger }) {
  return (options && options.logger) || new NoopLogger();
}
