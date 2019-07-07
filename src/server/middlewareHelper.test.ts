import partialMockOf from '../../tests/infrastructure/mockOf';
import { EndpointHandler } from '../server';
import { HandlerMatchIterator } from './middlewareHelper';

describe('server/middlewareHelper', () => {
  describe('HandlerMatchIterator', () => {
    it('should return handlers that match', () => {
      const requestLogger = partialMockOf<EndpointHandler>({
        match: jest.fn().mockReturnValue({})
      });

      const getProduct = partialMockOf<EndpointHandler>({
        match: jest.fn().mockReturnValue({ id: '1337' })
      });

      const getProducts = partialMockOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined)
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
      const handler1 = partialMockOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined)
      });
      const handler2 = partialMockOf<EndpointHandler>({
        match: jest.fn().mockReturnValue(undefined)
      });

      const allHandlers = [handler1, handler2];

      const handlerMatchIterator = new HandlerMatchIterator(allHandlers, { method: 'GET', url: '/etc' });

      const handlerMatch = handlerMatchIterator.getNextMatch();
      expect(handlerMatch).toBeUndefined();
    });
  });
});
