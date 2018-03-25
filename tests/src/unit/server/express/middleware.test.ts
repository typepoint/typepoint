import * as express from 'express';
import * as sinon from 'sinon';
import { expect } from 'chai';

import { combineMiddlewares } from '../../../../../src/server/express/middleware';
import partialMockOf from '../../../../infrastructure/mockOf';

describe('server/express/middleware', () => {
  describe('combineMiddlewares', () => {
    let req: express.Request;
    let res: express.Response;
    let next: sinon.SinonSpy;
    let middlewares: express.Handler[];
    let result: express.Handler;

    beforeEach(() => {
      req = partialMockOf<express.Request>({});
      res = partialMockOf<express.Response>({});
      next = sinon.spy();
      middlewares = [
        sinon.stub().callsArg(2),
        sinon.stub().callsArg(2),
        sinon.stub().callsArg(2)
      ];
      result = combineMiddlewares(middlewares);
    });

    it('should combine one or more middlewares into a single handler function', () => {
      expect(result).to.be.a('function');
    });

    it('should call each middleware in turn when called', () => {
      result(req, res, next);

      for (const middleware of middlewares) {
        expect(middleware).to.have.been.calledWith(req, res, sinon.match.any);
        expect(middleware).to.have.been.calledOnce;
      }

      expect(next).to.have.been.calledOnce;
    });
  });
});
