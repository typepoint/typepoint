import { expect } from 'chai';
import * as sinon from 'sinon';

import { HandlerMatchIterator } from '../../../../server/middlewareHelper';
import { EndpointHandler } from '../../../../server';
import partialMockOf from '../../../infrastructure/mockOf';

describe('server/middlewareHelper', () => {
  describe('HandlerMatchIterator', () => {
    it('should return handlers that match', () => {
      const requestLogger = partialMockOf<EndpointHandler>({
        match: sinon.stub().returns({})
      });

      const getProduct = partialMockOf<EndpointHandler>({
        match: sinon.stub().returns({ id: '1337' })
      })

      const getProducts = partialMockOf<EndpointHandler>({
        match: sinon.stub().returns(undefined)
      })

      const allHandlers = [requestLogger, getProducts, getProduct];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, { method: 'GET', url: '/etc' });

      let handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).to.not.be.undefined;
      expect(handlerMatch).to.have.property('parsedUrl').that.deep.equals({});
      expect(handlerMatch).to.have.property('handler').that.equals(requestLogger);

      handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).to.not.be.undefined;
      expect(handlerMatch).to.have.property('parsedUrl').that.deep.equals({ id: '1337' });
      expect(handlerMatch).to.have.property('handler').that.equals(getProduct);

      handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).to.be.undefined;
    });

    it('should return undefined when no matching handlers', () => {
      const handler1 = partialMockOf<EndpointHandler>({
        match: sinon.stub().returns(undefined)
      })
      const handler2 = partialMockOf<EndpointHandler>({
        match: sinon.stub().returns(undefined)
      })

      const allHandlers = [handler1, handler2];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, { method: 'GET', url: '/etc' });

      const handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).to.be.undefined;
    });
  });
});
