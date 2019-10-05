import * as express from 'express';
import { combineMiddlewares } from './middleware';
import partialMockOf from '../../../tests/infrastructure/mockOf';

describe('server/express/middleware', () => {
  describe('combineMiddlewares', () => {
    let req: express.Request;
    let res: express.Response;
    let next: jest.Mock<any, any>;
    let middlewares: express.Handler[];
    let result: express.Handler;

    beforeEach(() => {
      req = partialMockOf<express.Request>({});
      res = partialMockOf<express.Response>({});
      next = jest.fn();
      middlewares = [
        jest.fn().mockImplementation((_0, _1, cb) => cb()),
        jest.fn().mockImplementation((_0, _1, cb) => cb()),
        jest.fn().mockImplementation((_0, _1, cb) => cb())
      ];
      result = combineMiddlewares(middlewares);
    });

    it('should combine one or more middlewares into a single handler function', () => {
      expect(result).toBeInstanceOf(Function);
    });

    it('should call each middleware in turn when called', () => {
      result(req, res, next);

      for (const middleware of middlewares) {
        expect(middleware).toHaveBeenCalledWith(req, res, expect.anything());
        expect(middleware).toHaveBeenCalledTimes(1);
      }

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
