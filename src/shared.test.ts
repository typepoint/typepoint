import { expect } from 'chai';

import { Empty, EndpointDefinition, ArrayOf, arrayOf, isArrayOf } from './shared';
import { Product } from '../tests/fixtures/products';

describe('shared', () => {
  describe('EndpointDefinition', () => {
    it('should return an endpoint definition with the specified method and path', () => {
      const method = 'POST';
      const addProduct = new EndpointDefinition<Empty, Product, Product>(method, path => path.literal('products'));

      expect(addProduct).to.not.be.null;
      expect(addProduct).to.have.property('method', method);
      expect(addProduct).to.have.property('path', '/products');
    });

    it('should default a GET method if method is not specified', () => {
      const getProducts = new EndpointDefinition<Empty, Empty, Product[]>(path => path.literal('products'));

      expect(getProducts).to.not.be.null;
      expect(getProducts).to.have.property('method', 'GET');
      expect(getProducts).to.have.property('path', '/products');
    });

    it('should error if method is not supported', () => {
      const method = 'SQUANCH';
      expect(() => new EndpointDefinition<Empty, Empty, Product[]>(method as any, path => path.literal('products'))).to.throw('Unsupported HTTP method: SQUANCH');
    });

    it('should error when trying to reference typeInfo', () => {
      const path = '/products';
      const getProducts = new EndpointDefinition<Empty, Empty, Product[]>(path => path.literal('products'));
      expect(() => getProducts.typeInfo()).to.throw(
        'Do not evaluate EndpointDefinition.typeInfo(). It is reserved for internal use only.'
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

      const method = 'GET';
      const getClient = new EndpointDefinition<GetClientRequestParams, Empty, Client>({
        method,
        path: path => path.literal('clients').param('id'),
        requestParams: GetClientRequestParams,
        requestBody: Empty,
        responseBody: Client
      });

      expect(getClient).to.not.be.null;
      expect(getClient).to.have.property('method', method);
      expect(getClient).to.have.property('path', '/clients/:id');
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

    it('should include classInfo when defining endpoint using classes that includes an array', () => {
      class GetClientsParams {
        includeInactive: boolean = false;
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

      const arrayOfClient = arrayOf(Client);

      const getClients = new EndpointDefinition({
        path: path => path.literal('clients'),
        requestParams: GetClientsParams,
        requestBody: Empty,
        responseBody: arrayOfClient
      });

      expect(getClients).to.not.be.null;
      expect(getClients).to.have.property('method', 'GET');
      expect(getClients).to.have.property('path', '/clients');
      expect(getClients.classInfo).to.be.an('object');
      expect(getClients.classInfo)
        .to.have.property('request')
        .that.has.property('params', GetClientsParams);
      expect(getClients.classInfo)
        .to.have.property('request')
        .that.has.property('body', Empty);
      expect(getClients.classInfo)
        .to.have.property('response')
        .that.has.property('body', arrayOfClient);
    });
  });

  describe('arrayOf', () => {
    class User {
      id: string = ''
      name: string = '';
    }

    it('should describe the class that it is an array of when instantiated', () => {
      const ArrayOfUser = arrayOf(User);
      expect(typeof ArrayOfUser).to.equal('function');

      const arrayOfUser = new ArrayOfUser();
      expect(arrayOfUser)
        .to.have.property('classInfo')
        .that.has.property('element', User);
    });

    it('should error if typeInfo is evaluated', () => {
      const ArrayOfUser = arrayOf(User);
      const arrayOfUser = new ArrayOfUser();
      expect(() => arrayOfUser.typeInfo()).to.throw('Do not evaluate ArrayOf.typeInfo(). It is reserved for internal use only.');
    });
  });

  describe('isArrayOfClass', () => {
    class User {
      id: string = ''
      name: string = '';
    }

    it('should return true for arrayOf results', () => {
      const ArrayOfUser = arrayOf(User);
      expect(isArrayOf(ArrayOfUser)).to.be.true;
    });

    it('should return false for anything else', () => {
      const ArrayOfUser = User;
      expect(isArrayOf(ArrayOfUser)).to.be.false;
    });
  });

});
