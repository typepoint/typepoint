import { expect } from 'chai';

import { Empty, EndpointDefinition, ArrayOf, arrayOf } from './shared';
import { Product } from '../tests/fixtures/products';

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

    it('should error when trying to reference typeInfo', () => {
      const path = '/products';
      const getProducts = new EndpointDefinition<Empty, Empty, Product[]>(path);
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
      const path = '/clients/:id';
      const getClient = new EndpointDefinition<GetClientRequestParams, Empty, Client>({
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

      const path = '/clients';
      const getClients = new EndpointDefinition({
        path,
        requestParams: GetClientsParams,
        requestBody: Empty,
        responseBody: arrayOfClient
      });

      expect(getClients).to.not.be.null;
      expect(getClients).to.have.property('method', 'GET');
      expect(getClients).to.have.property('path', path);
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
});
