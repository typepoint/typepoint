import { expect } from 'chai';
import { Request as ExpressRequest } from 'express';

import { Request as StrongPointRequest } from '../../../../../src/server';
import { StrongPointExpressRequest } from '../../../../../src/server/express/strongPointExpressRequest';

import partialMockOf from '../../../../infrastructure/mockOf';
import { Product } from '../../../../fixtures';

describe('server/express/strongPointExpressRequest', () => {
  describe('StrongPointExpressRequest', () => {
    it('should create a StrongPoint Request from an Express request', () => {
      const expressRequest = partialMockOf<ExpressRequest>({
        url: '/products/1?format=html',
        method: 'put',
        query: {
          format: 'html'
        },
        body: {
          name: 'Plumbus',
          url: 'http://rickandmorty.wikia.com/wiki/Plumbus'
        }
      });

      const actual = new StrongPointExpressRequest(expressRequest);

      const expectation: StrongPointRequest<any, Partial<Product>> = {
        method: 'PUT',
        url: '/products/1?format=html',
        params: {
          format: 'html'
        },
        body: {
          name: 'Plumbus',
          url: 'http://rickandmorty.wikia.com/wiki/Plumbus'
        }
      };

      expect(actual).to.have.property('method', 'PUT');
      expect(actual).to.have.property('url', '/products/1?format=html');
      expect(actual).to.have.property('params').that.deep.equals({
        format: 'html'
      });
      expect(actual).to.have.property('body').that.deep.equals({
        name: 'Plumbus',
        url: 'http://rickandmorty.wikia.com/wiki/Plumbus'
      });
    });
  });
});
