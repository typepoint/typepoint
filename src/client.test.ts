import axios from 'axios';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { Product } from '../tests/fixtures';
import * as fixtures from '../tests/fixtures';
import partialMockOf from '../tests/infrastructure/mockOf';
import StrongPointClient from './client';
import { Empty, EndpointDefinition } from './shared';

describe('client', () => {
  describe('StrongPointClient', () => {
    let products: Product[];
    let getProducts: EndpointDefinition<Empty, Empty, Product[]>;
    let axiosMock: typeof axios;

    beforeEach(() => {
      products = fixtures.getProducts();
      getProducts = new EndpointDefinition<Empty, Empty, Product[]>(path => path.literal('products'));

      axiosMock = partialMockOf<typeof axios>({
        request: sinon.stub().returns(Promise.resolve({
          status: 200,
          statusText: 'OK',
          data: fixtures.getProducts()
        }))
      });
    });

    it('should make requests through axios', async () => {
      const client = new StrongPointClient({
        axios: axiosMock
      });

      const response = await client.fetch(getProducts);

      expect(axiosMock.request).to.have.been.calledWith({
        method: 'GET',
        url: '/products'
      });
      expect(response).to.have.property('body').deep.equals(products);
      expect(response).to.have.property('statusCode').deep.equals(200);
      expect(response).to.have.property('statusText').deep.equals('OK');
      expect(response).to.have.property('body').deep.equals(products);
    });
  });
});
