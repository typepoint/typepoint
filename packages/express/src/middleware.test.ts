import * as express from 'express';
import { partialOf } from 'jest-helpers';
import { combineMiddlewares } from './middleware';

describe('server/express/middleware', () => {
  describe('combineMiddlewares', () => {
    let req: express.Request;
    let res: express.Response;
    let next: jest.Mock<any, any>;
    let middlewares: express.Handler[];
    let result: express.Handler;

    beforeEach(() => {
      req = partialOf<express.Request>({});
      res = partialOf<express.Response>({});
      next = jest.fn();
      middlewares = [
        jest.fn().mockImplementation((_0, _1, cb) => cb()),
        jest.fn().mockImplementation((_0, _1, cb) => cb()),
        jest.fn().mockImplementation((_0, _1, cb) => cb()),
      ];
      result = combineMiddlewares(middlewares);
    });

    it('should combine one or more middlewares into a single handler function', () => {
      expect(result).toBeInstanceOf(Function);
    });

    it('should call each middleware in turn when called', () => {
      result(req, res, next);

      middlewares.forEach((middleware) => {
        expect(middleware).toHaveBeenCalledWith(req, res, expect.anything());
        expect(middleware).toHaveBeenCalledTimes(1);
      });

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
