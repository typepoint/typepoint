import { expect } from 'chai';

import { Empty, EndpointDefinition } from './shared';
import { Product } from '../dist/tests/fixtures/products';

describe('shared', () => {
  describe('EndpointDefinition', () => {
    it('should return an endpoint definition with the specified method and path', () => {
      const method = 'POST';
      const path = '/products';
      const addProduct = new EndpointDefinition<Empty, Product, Product>(method, path);

      expect(addProduct).to.not.be.null;
      expect(addProduct).to.have.property('method', method);
      expect(addProduct).to.have.property('path', path);
    });

    it('should default a GET method if method is not specified', () => {
      const path = '/products';
      const getProducts = new EndpointDefinition<Empty, Empty, Product[]>(path);

      expect(getProducts).to.not.be.null;
      expect(getProducts).to.have.property('method', 'GET');
      expect(getProducts).to.have.property('path', path);
    });

    it('should error if method is not supported', () => {
      const method = 'SQUANCH';
      const path = '/products';
      expect(() => new EndpointDefinition<Empty, Empty, Product[]>(method as any, path)).to.throw('Unsupported HTTP method: SQUANCH');
    });

    it('should error when trying to reference typeInfo property', () => {
      const path = '/products';
      const getProducts = new EndpointDefinition<Empty, Empty, Product[]>(path);
      expect(() => getProducts.typeInfo).to.throw(
        'Do not evaluate definition.typeInfo. It is reserved for internal use only.'
      );
    });

    it('should include classInfo when defining endpoint using classes', () => {
      class GetClientRequestParams {
        constructor(public id: number) {
        }
      }

      class Client {
        constructor(
          public name: string,
          public creationDate: Date,
          public modificationDate: Date,
          id?: number
        ) {
        }
      }

      const method = 'POST';
      const path = '/clients/:id';
      const getClient = new EndpointDefinition<GetClientRequestParams, Empty, Client[]>({
        method,
        path,
        requestParams: GetClientRequestParams,
        requestBody: Empty,
        responseBody: Client
      });

      expect(getClient).to.not.be.null;
      expect(getClient).to.have.property('method', method);
      expect(getClient).to.have.property('path', path);
      expect(getClient.classInfo).to.be.an('object');
      expect(getClient.classInfo)
        .to.have.property('request')
        .that.has.property('params', GetClientRequestParams);
      expect(getClient.classInfo)
        .to.have.property('request')
        .that.has.property('body', Empty);
      expect(getClient.classInfo)
        .to.have.property('response')
        .that.has.property('body', Client);
    });
  });
});
