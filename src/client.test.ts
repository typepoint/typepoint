import axios from 'axios';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { Product } from '../tests/fixtures';
import * as fixtures from '../tests/fixtures';
import partialMockOf from '../tests/infrastructure/mockOf';
import { TypePointClient, TypePointClientResponse, TypePointClientResponseError } from './client';
import { Empty, EndpointDefinition } from './shared';

describe('client', () => {
  describe('TypePointClient', () => {
    let products: Product[];
    let getProducts: EndpointDefinition<Empty, Empty, Product[]>;
    let axiosMock: typeof axios;
    let client: TypePointClient;
    let response: TypePointClientResponse<Product[]> | undefined;
    let error: TypePointClientResponseError | undefined;

    beforeEach(() => {
      products = fixtures.getProducts();
      getProducts = new EndpointDefinition<Empty, Empty, Product[]>(path => path.literal('products'));
    });

    async function makeRequest() {
      client = new TypePointClient({
        axios: axiosMock
      });

      try {
        response = await client.fetch(getProducts);
        error = undefined;
      } catch (err) {
        response = undefined;
        error = err;
      }
    }

    describe('for successful requests', () => {
      beforeEach(async () => {
        axiosMock = partialMockOf<typeof axios>({
          request: sinon.stub().resolves({
            status: 200,
            statusText: 'OK',
            data: fixtures.getProducts()
          })
        });

        await makeRequest();
      });

      it('should make requests through axios', async () => {
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

    describe('when response is an error', () => {
      beforeEach(async () => {
        axiosMock = partialMockOf<typeof axios>({
          request: sinon.stub().rejects({
            response: {
              status: 404,
              statusText: 'NOT FOUND',
              data: 'Nope'
            }
          })
        });

        await makeRequest();
      });

      it('should include the response in the rejected error', () => {
        expect(response).to.be.undefined;
        expect(error).to.exist;
        expect(error).to.have.property('response');
        expect(error && error.response).to.contain({
          statusCode: 404,
          statusText: 'NOT FOUND',
          body: 'Nope'
        });
      });
    });

    describe('when there is no response (e.g. no network connection)', () => {
      beforeEach(async () => {
        axiosMock = partialMockOf<typeof axios>({
          request: sinon.stub().rejects({
            message: 'Jen dropped the internet!'
          })
        });

        await makeRequest();
      });

      it('should not include a response in the rejected error', () => {
        expect(response).to.be.undefined;
        expect(error).to.exist;
        expect(error).to.have.property('response', undefined);
      });
    });
  });
});
