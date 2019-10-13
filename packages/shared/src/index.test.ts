// eslint-disable-next-line max-classes-per-file
import { Product } from '@typepoint/fixtures';
import {
  Empty, EndpointDefinition, arrayOf, isArrayOf,
} from '.';

describe('shared', () => {
  describe('EndpointDefinition', () => {
    it('should return an endpoint definition with the specified method and path', () => {
      const method = 'POST';
      const addProduct = new EndpointDefinition<Empty, Product, Product>(method, (path) => path.literal('products'));

      expect(addProduct).toBeDefined();
      expect(addProduct).toHaveProperty('method', method);
      expect(addProduct).toHaveProperty('path', '/products');
    });

    it('should default a GET method if method is not specified', () => {
      const getProducts = new EndpointDefinition<Empty, Empty, Product[]>((path) => path.literal('products'));

      expect(getProducts).toBeDefined();
      expect(getProducts).toHaveProperty('method', 'GET');
      expect(getProducts).toHaveProperty('path', '/products');
    });

    it('should error if method is not supported', () => {
      const method = 'SQUANCH';
      expect(
        () => new EndpointDefinition<Empty, Empty, Product[]>(method as any, (path) => path.literal('products')),
      ).toThrow('Unsupported HTTP method: SQUANCH');
    });

    it('should error when trying to reference typeInfo', () => {
      const getProducts = new EndpointDefinition<Empty, Empty, Product[]>((path) => path.literal('products'));
      expect(() => getProducts.typeInfo()).toThrow(
        'Do not evaluate EndpointDefinition.typeInfo(). It is reserved for internal use only.',
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
          _id?: number,
        ) {
        }
      }

      const method = 'GET';
      const getClient = new EndpointDefinition<GetClientRequestParams, Empty, Client>({
        method,
        path: (path) => path.literal('clients').param('id'),
        requestParams: GetClientRequestParams,
        requestBody: Empty,
        responseBody: Client,
      });

      expect(getClient).toBeDefined();
      expect(getClient).toHaveProperty('method', method);
      expect(getClient).toHaveProperty('path', '/clients/:id');
      expect(getClient.classInfo).toHaveProperty(['request', 'params'], GetClientRequestParams);
      expect(getClient.classInfo).toHaveProperty(['request', 'body'], Empty);
      expect(getClient.classInfo).toHaveProperty(['response', 'body'], Client);
    });

    it('should include classInfo when defining endpoint using classes that includes an array', () => {
      class GetClientsParams {
        includeInactive = false;
      }

      class Client {
        constructor(
          public name: string,
          public creationDate: Date,
          public modificationDate: Date,
          id?: number,
        ) {
        }
      }

      const arrayOfClient = arrayOf(Client);

      const getClients = new EndpointDefinition({
        path: (path) => path.literal('clients'),
        requestParams: GetClientsParams,
        requestBody: Empty,
        responseBody: arrayOfClient,
      });

      expect(getClients).toBeDefined();
      expect(getClients).toHaveProperty('method', 'GET');
      expect(getClients).toHaveProperty('path', '/clients');
      expect(getClients.classInfo).toHaveProperty(['request', 'params'], GetClientsParams);
      expect(getClients.classInfo).toHaveProperty(['request', 'body'], Empty);
      expect(getClients.classInfo).toHaveProperty(['response', 'body'], arrayOfClient);
    });
  });

  describe('arrayOf', () => {
    class User {
      id = ''

      name = '';
    }

    it('should describe the class that it is an array of when instantiated', () => {
      const ArrayOfUser = arrayOf(User);
      expect(typeof ArrayOfUser).toBe('function');

      const arrayOfUser = new ArrayOfUser();
      expect(arrayOfUser).toHaveProperty(['classInfo', 'element'], User);
    });

    it('should error if typeInfo is evaluated', () => {
      const ArrayOfUser = arrayOf(User);
      const arrayOfUser = new ArrayOfUser();
      expect(
        () => arrayOfUser.typeInfo(),
      ).toThrow('Do not evaluate ArrayOf.typeInfo(). It is reserved for internal use only.');
    });
  });

  describe('isArrayOfClass', () => {
    class User {
      id = ''

      name = '';
    }

    it('should return true for arrayOf results', () => {
      const ArrayOfUser = arrayOf(User);
      expect(isArrayOf(ArrayOfUser)).toBe(true);
    });

    it('should return false for anything else', () => {
      const ArrayOfUser = User;
      expect(isArrayOf(ArrayOfUser)).toBe(false);
    });
  });
});
