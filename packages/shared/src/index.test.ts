// eslint-disable-next-line max-classes-per-file
import { Product, Todo } from '@typepoint/fixtures';
import { assert, Equal } from 'type-assertions';
import {
  EndpointDefinitionInvalidConstructorArgs,
  EndpointDefinition,
  arrayOf,
  ArrayOf,
  cleanseHttpMethod,
  Constructor,
  defineEndpoint,
  Empty,
  isArrayOf,
  isEmptyClass,
  isEmptyValue,
} from './index';

describe('shared', () => {
  describe('arrayOf', () => {
    class User {
      id = '';

      name = '';
    }

    it('should describe the class that it is an array of when instantiated', () => {
      const ArrayOfUser = arrayOf(User);
      expect(typeof ArrayOfUser).toBe('function');

      type Actual = typeof ArrayOfUser;
      type Expected = Constructor<ArrayOf<User>>;
      assert<Equal<Actual, Expected>>();

      const arrayOfUser = new ArrayOfUser();
      expect(arrayOfUser).toHaveProperty(['classInfo', 'element'], User);
    });
  });

  describe('defineEndpoint', () => {
    it('should return an endpoint definition with the specified method and path', () => {
      const method = 'POST';
      const addProduct = defineEndpoint<Empty, Product, Product>(method, (path) => path.literal('products'));

      assert<Equal<typeof addProduct, EndpointDefinition<Empty, Product, Product>>>();

      expect(addProduct).toBeDefined();
      expect(addProduct).toHaveProperty('method', method);
      expect(addProduct).toHaveProperty('path', '/products');
    });

    it('should default a GET method if method is not specified', () => {
      const getProducts = defineEndpoint<Empty, Empty, Product[]>((path) => path.literal('products'));

      assert<Equal<typeof getProducts, EndpointDefinition<Empty, Empty, Product[]>>>();

      expect(getProducts).toBeDefined();
      expect(getProducts).toHaveProperty('method', 'GET');
      expect(getProducts).toHaveProperty('path', '/products');

      const getTodos = defineEndpoint<Empty, Empty, Todo[]>('', (path) => path.literal('/api/todos'));
      expect(getTodos).toHaveProperty('method', 'GET');
    });

    it('should include classInfo when defining endpoint using classes', () => {
      class GetClientRequestParams {
        // eslint-disable-next-line no-empty-function
        constructor(public id: number) {
        }
      }

      class Client {
        constructor(
          public name: string,
          public creationDate: Date,
          public modificationDate: Date,
          _id?: number,
        // eslint-disable-next-line no-empty-function
        ) {
        }
      }

      const method = 'GET';
      const getClient = defineEndpoint({
        method,
        path: (path) => path.literal('clients').param('id'),
        requestParams: GetClientRequestParams,
        requestBody: Empty,
        responseBody: Client,
      });

      assert<Equal<typeof getClient, EndpointDefinition<GetClientRequestParams, Empty, Client>>>();

      expect(getClient).toBeDefined();
      expect(getClient).toHaveProperty('method', method);
      expect(getClient).toHaveProperty('path', '/clients/:id');
      expect(getClient.classInfo).toHaveProperty(['request', 'params'], GetClientRequestParams);
      expect(getClient.classInfo).toHaveProperty(['request', 'body'], Empty);
      expect(getClient.classInfo).toHaveProperty(['response', 'body'], Client);
    });

    it('should include classInfo when defining endpoint using classes that includes an array using arrayOf', () => {
      class GetClientsParams {
        includeInactive = false;
      }

      class Client {
        constructor(
          public name: string,
          public creationDate: Date,
          public modificationDate: Date,
          id?: number,
        // eslint-disable-next-line no-empty-function
        ) {
        }
      }

      const arrayOfClient = arrayOf(Client);

      const getClients = defineEndpoint({
        path: (path) => path.literal('clients'),
        requestParams: GetClientsParams,
        requestBody: Empty,
        responseBody: arrayOfClient,
      });

      assert<Equal<typeof getClients, EndpointDefinition<GetClientsParams, Empty, Client[]>>>();

      expect(getClients).toBeDefined();
      expect(getClients).toHaveProperty('method', 'GET');
      expect(getClients).toHaveProperty('path', '/clients');
      expect(getClients.classInfo).toHaveProperty(['request', 'params'], GetClientsParams);
      expect(getClients.classInfo).toHaveProperty(['request', 'body'], Empty);
      expect(getClients.classInfo).toHaveProperty(['response', 'body'], arrayOfClient);
    });
  });

  it('should include classInfo when defining endpoint using classes that includes an array using [Type]', () => {
    class GetClientsParams {
      includeInactive = false;
    }

    class Client {
      constructor(
        public name: string,
        public creationDate: Date,
        public modificationDate: Date,
        id?: number,
      // eslint-disable-next-line no-empty-function
      ) {
      }
    }

    const getClients = defineEndpoint({
      path: (path) => path.literal('clients'),
      requestParams: GetClientsParams,
      requestBody: Empty,
      responseBody: [Client],
    });

    assert<Equal<typeof getClients, EndpointDefinition<GetClientsParams, Empty, Client[]>>>();

    expect(getClients).toBeDefined();
    expect(getClients).toHaveProperty('method', 'GET');
    expect(getClients).toHaveProperty('path', '/clients');
    expect(getClients.classInfo).toHaveProperty(['request', 'params'], GetClientsParams);
    expect(getClients.classInfo).toHaveProperty(['request', 'body'], Empty);
    expect(getClients.classInfo).toHaveProperty(['response', 'body'], [Client]);
  });

  it('should default classInfo types to Empty when defining '
  + 'using options object but not specifying any classes', () => {
    const generateThumbnailsEndpoint = defineEndpoint({
      method: 'POST',
      path: (path) => path.literal('/api/generateThumbnails'),
    });

    const { classInfo } = generateThumbnailsEndpoint;

    expect(classInfo).toBeTruthy();
    if (!classInfo) {
      return;
    }

    expect(classInfo.request.params).toEqual(Empty);
    expect(classInfo.request.body).toEqual(Empty);
    expect(classInfo.response.body).toEqual(Empty);
  });

  it('should parse urls', () => {
    class GetTodoRequestParams {
      id!: string;

      includeDetails?: boolean;
    }
    const getTodo = defineEndpoint({
      path: (path) => path.literal('api/todos').param('id'),
      requestParams: GetTodoRequestParams,
      responseBody: Todo,
    });

    const match = getTodo.parse('https://todos.ninja/api/todos/123?includeDetails=true');
    expect(match).toEqual({
      params: {
        id: '123',
        includeDetails: 'true',
      },
      path: '/api/todos/123',
      postPath: '?includeDetails=true',
      prePath: 'https://todos.ninja',
    });
  });

  it('should generate urls', () => {
    class GetTodoRequestParams {
      id!: string;

      includeDetails?: boolean;
    }
    const getTodo = defineEndpoint({
      path: (path) => path.literal('api/todos').param('id'),
      requestParams: GetTodoRequestParams,
      responseBody: Todo,
    });

    const url = getTodo.url({ params: { id: '123', includeDetails: true } });
    expect(url).toEqual('/api/todos/123?includeDetails=true');
  });

  it('should error if called incorrectly', () => {
    expect(() => (defineEndpoint as any)()).toThrow(
      new EndpointDefinitionInvalidConstructorArgs([]),
    );

    expect(() => defineEndpoint('/api/products' as any)).toThrow(
      new EndpointDefinitionInvalidConstructorArgs(['/api/products']),
    );

    expect(() => defineEndpoint('get', '/api/products' as any)).toThrow(
      new EndpointDefinitionInvalidConstructorArgs(['get', '/api/products']),
    );

    expect(() => (defineEndpoint as any)('get', '/api/products' as any, true)).toThrow(
      new EndpointDefinitionInvalidConstructorArgs(['get', '/api/products', true]),
    );
  });
});

describe('isArrayOf', () => {
  class User {
    id = '';

    name = '';
  }

  it('should return true for arrayOf results', () => {
    const ArrayOfUser = arrayOf(User);
    expect(isArrayOf(ArrayOfUser)).toBe(true);
  });

  it('should return false for anything else', () => {
    const ArrayOfUser = User;
    expect(isArrayOf(ArrayOfUser)).toBe(false);

    expect(isArrayOf(null)).toBe(false);
    expect(isArrayOf(true)).toBe(false);
  });
});

describe('isEmptyClass', () => {
  it('should return true when passed in Empty', () => {
    expect(isEmptyClass(Empty)).toBeTruthy();
  });

  it('should return false when not passed in Empty', () => {
    class SomeOtherClass {}
    expect(isEmptyClass(SomeOtherClass)).toBeFalsy();
  });
});

describe('isEmptyValue', () => {
  it('should return true for empty values', () => {
    expect(isEmptyValue(null)).toBeTruthy();
    expect(isEmptyValue(undefined)).toBeTruthy();
    expect(isEmptyValue({})).toBeTruthy();
  });

  it('should return false for non empty values', () => {
    expect(isEmptyValue({ key: 'value' })).toBeFalsy();
  });
});

describe('cleanseHttpMethod', () => {
  it('should return method in uppercase', () => {
    expect(cleanseHttpMethod('get')).toBe('GET');
    expect(cleanseHttpMethod('post')).toBe('POST');
    expect(cleanseHttpMethod('squanch')).toBe('SQUANCH');
  });
});
