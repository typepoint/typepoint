import axios from 'axios';
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
          request: jest.fn().mockResolvedValue({
            status: 200,
            statusText: 'OK',
            data: fixtures.getProducts()
          })
        });

        await makeRequest();
      });

      it('should make requests through axios', async () => {
        expect(axiosMock.request).toHaveBeenCalledWith({
          method: 'GET',
          url: '/products'
        });
        expect(response).toHaveProperty('body', products);
        expect(response).toHaveProperty('statusCode', 200);
        expect(response).toHaveProperty('statusText', 'OK');
      });
    });

    describe('when response is an error', () => {
      beforeEach(async () => {
        axiosMock = partialMockOf<typeof axios>({
          request: jest.fn().mockRejectedValue({
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
        expect(response).toBeUndefined();
        expect(error).toBeDefined();
        expect(error).toHaveProperty('response');
        expect(error && error.response).toMatchObject({
          statusCode: 404,
          statusText: 'NOT FOUND',
          body: 'Nope'
        });
      });
    });

    describe('when there is no response (e.g. no network connection)', () => {
      beforeEach(async () => {
        axiosMock = partialMockOf<typeof axios>({
          request: jest.fn().mockRejectedValue({
            message: 'Jen dropped the internet!'
          })
        });

        await makeRequest();
      });

      it('should not include a response in the rejected error', () => {
        expect(response).toBeUndefined();
        expect(error).toBeDefined();
        expect(error).toHaveProperty('response', undefined);
      });
    });
  });
});
