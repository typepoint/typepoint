import { partialOf } from 'jest-helpers';
import { EndpointHandler } from './index';
import { HandlerMatchIterator } from './middlewareHelper';

describe('server/middlewareHelper', () => {
  describe('HandlerMatchIterator', () => {
    it('should return handlers that match', () => {
      const requestLogger = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue({}),
      });

      const getProduct = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue({ id: '1337' }),
      });

      const getProducts = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined),
      });

      const allHandlers = [requestLogger, getProducts, getProduct];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, { method: 'GET', url: '/etc' });

      let handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeDefined();
      expect(handlerMatch).toHaveProperty('parsedUrl', {});
      expect(handlerMatch).toHaveProperty('handler', requestLogger);

      handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeDefined();
      expect(handlerMatch).toHaveProperty('parsedUrl', { id: '1337' });
      expect(handlerMatch).toHaveProperty('handler', getProduct);

      handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeUndefined();
    });

    it('should return undefined when no matching handlers', () => {
      const handler1 = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined),
      });
      const handler2 = partialOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined),
      });

      const allHandlers = [handler1, handler2];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, { method: 'GET', url: '/etc' });

      const handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeUndefined();
    });
  });
});
