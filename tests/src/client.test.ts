import axios from 'axios';
import { expect } from 'chai';
import * as sinon from 'sinon';

import StrongPointClient from '../../client';
import partialMockOf from '../infrastructure/mockOf';
import { defineEndpoint, EndpointDefinition } from '../../shared';
import { Product, products } from '../fixtures/products';

describe('client', () => {
  describe('StrongPointClient', () => {
    let getProducts: EndpointDefinition<undefined, undefined, Product>;
    let axiosMock: typeof axios;

    beforeEach(() => {
      getProducts = defineEndpoint('/products');

      axiosMock = partialMockOf<typeof axios>({
        request: sinon.stub().returns(Promise.resolve({
          status: 200,
          statusText: 'OK',
          data: products
        }))
      });
    });

    it('should make requests through axios', async () => {
      const client = new StrongPointClient({
        axios: axiosMock
      });

      const response = await client.fetch(getProducts, {
      });

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
