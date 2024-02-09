import { Request, Response } from 'express';
import { partialOf } from 'jest-helpers';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { Logger, NoopLogger } from '@typepoint/shared';
import { createContext, getLogger, trySendInternalServerError } from './utils';
import { TypePointExpressRequest } from './typePointExpressRequest';
import { TypePointExpressResponse } from './typePointExpressResponse';

describe('createContext', () => {
  it('should return a typepoint context', () => {
    const req = partialOf<Request>({
      method: 'POST',
    });
    const res = partialOf<Response>({
    });
    const context = createContext(req, res);
    expect(context.meta).toEqual({});
    expect(context.request).toBeInstanceOf(TypePointExpressRequest);
    expect(context.response).toBeInstanceOf(TypePointExpressResponse);
    expect(context.endpoint).toBeUndefined();
  });
});

describe('trySendInternalServerError', () => {
  it('should respond with the given error message when response has not been sent yet', () => {
    const res = partialOf<Response>({
      headersSent: false,
      statusCode: undefined,
      json: jest.fn(),
      end: jest.fn(),
    });

    const error = new Error('Computer says no');

    trySendInternalServerError(res, error);

    expect(res.statusCode).toEqual(INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(error.message);
    expect(res.end).toHaveBeenCalledWith();
  });

  it('should respond with the given error when response has not been sent yet', () => {
    const res = partialOf<Response>({
      headersSent: false,
      statusCode: undefined,
      json: jest.fn(),
      end: jest.fn(),
    });

    const error = 'Computer says no';

    trySendInternalServerError(res, error);

    expect(res.statusCode).toEqual(INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(error);
    expect(res.end).toHaveBeenCalledWith();
  });

  it('should not send error if response already sent', () => {
    const res = partialOf<Response>({
      headersSent: true,
      statusCode: OK,
      json: jest.fn(),
      end: jest.fn(),
    });

    const error = new Error('Computer says no');

    trySendInternalServerError(res, error);

    expect(res.statusCode).toEqual(OK);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });
});

describe('getLogger', () => {
  it('should return the given logger', () => {
    const logger = partialOf<Logger>({});
    expect(getLogger({ logger })).toBe(logger);
  });

  it('should return a noop logger if no logger given', () => {
    expect(getLogger()).toBeInstanceOf(NoopLogger);
    expect(getLogger({})).toBeInstanceOf(NoopLogger);
  });
});
