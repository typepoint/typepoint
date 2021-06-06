import axios, { AxiosInstance } from 'axios';
import {
  defineEndpoint,
  Empty,
  EndpointDefinition,
} from '@typepoint/shared';
import * as fixtures from '@typepoint/fixtures';
import { partialOf } from 'jest-helpers';
import {
  assert, Extends, Equal, Not, UnionIncludesExact,
} from 'type-assertions';
import {
  FetchFunctionWithRequiredOptions,
  FetchFunctionWithOptionalOptions,
  FetchFunction,
  FetchParamsOptions,
  FetchBodyOptions,
  TypePointClient,
  TypePointClientResponseError,
  TypePointClientResponse,
} from './index';

describe('TypePointClient', () => {
  class AddTodoRequestBody {
    title!: string;
  }

  let getProductsEndpoint: EndpointDefinition<Empty, Empty, fixtures.Product[]>;
  let addTodoEndpoint: EndpointDefinition<Empty, AddTodoRequestBody, fixtures.Todo>;

  beforeEach(() => {
    getProductsEndpoint = defineEndpoint<Empty, Empty, fixtures.Product[]>(
      (path) => path.literal('api/products'),
    );

    addTodoEndpoint = defineEndpoint({
      method: 'POST',
      path: (path) => path.literal('api/todos'),
    });
  });

  it('should create its own instance of axios if none is provided', () => {
    jest.spyOn(axios, 'create').mockReturnValue(partialOf<AxiosInstance>({}));
    const _ = new TypePointClient();
    expect(axios.create).toHaveBeenCalled();
  });

  it('should include the response in the rejected error when response errors', async () => {
    const axiosMock = partialOf<typeof axios>({
      request: jest.fn().mockRejectedValue({
        response: {
          status: 404,
          statusText: 'NOT FOUND',
          data: 'Nope',
        },
      }),
    });

    const client = new TypePointClient({ axios: axiosMock });

    await expect(client.fetch(getProductsEndpoint))
      .rejects
      .toMatchObject({
        response: {
          statusCode: 404,
          statusText: 'NOT FOUND',
          body: 'Nope',
        },
      });
  });

  describe('when there is no response (e.g. no network connection)', () => {
    it('should not include a response in the rejected error', async () => {
      const axiosMock = partialOf<typeof axios>({
        request: jest.fn().mockRejectedValue({
          message: 'Jen dropped the internet!',
        }),
      });

      const client = new TypePointClient({ axios: axiosMock });

      await expect(client.fetch(getProductsEndpoint))
        .rejects
        .toMatchObject({
          response: undefined,
        });
    });
  });

  it('should make requests through axios', async () => {
    const axiosMock = partialOf<typeof axios>({
      request: jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: fixtures.getProducts(),
      }),
    });

    const client = new TypePointClient({ axios: axiosMock });

    await client.fetch(getProductsEndpoint);

    expect(axiosMock.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/products',
    });
  });

  it('should allow accessing headers via response', async () => {
    const axiosMock = partialOf<typeof axios>({
      request: jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: fixtures.getProducts(),
        headers: {
          'content-type': 'application/json',
        },
      }),
    });

    const client = new TypePointClient({ axios: axiosMock });

    const response = await client.fetch(getProductsEndpoint);

    expect(response.header('content-type')).toEqual('application/json');
  });

  it('should include body when making posts', async () => {
    const axiosMock = partialOf<typeof axios>({
      request: jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: fixtures.getTodos()[0],
      }),
    });

    const client = new TypePointClient({ axios: axiosMock });

    await client.fetch(addTodoEndpoint, {
      body: {
        title: 'Feed the cats',
      },
    });

    expect(axiosMock.request).toHaveBeenCalledWith({
      data: { title: 'Feed the cats' },
      method: 'POST',
      url: '/api/todos',
    });
  });

  it('allows request options to be optional when params and body not needed', () => {
    assert<Equal<FetchFunction, FetchFunctionWithOptionalOptions & FetchFunctionWithRequiredOptions>>();

    type FirstParam = Parameters<FetchFunctionWithOptionalOptions>[0];
    type SecondParam = Parameters<FetchFunctionWithOptionalOptions>[1];
    assert<Extends<FirstParam, EndpointDefinition<any, any, any>>>();

    // Ensure 2nd param can be undefined
    assert<UnionIncludesExact<SecondParam, undefined>>();

    type EmptyParamsOptions = FetchParamsOptions<Empty>;
    assert<Equal<EmptyParamsOptions, {}>>();

    type EmptyBodyOptions = FetchBodyOptions<Empty>;
    assert<Equal<EmptyBodyOptions, {}>>();
  });

  it('requires request options to be optional when params or body are required', () => {
    type FirstParam = Parameters<FetchFunctionWithRequiredOptions>[0];
    type SecondParam = Parameters<FetchFunctionWithRequiredOptions>[1];
    assert<Extends<FirstParam, EndpointDefinition<any, any, any>>>();

    // Ensure 2nd param cannot be undefined
    assert<Not<UnionIncludesExact<SecondParam, undefined>>>();

    assert<Extends<SecondParam, {} | { params: any } | { body: any } | { params: any; body: any }>>();

    type UpdateTodoParams = {
      id: string;
    }

    type UpdateTodoParamsOptions = FetchParamsOptions<UpdateTodoParams>;

    assert<Not<Equal<UpdateTodoParamsOptions, {}>>>();
    assert<Not<Equal<UpdateTodoParamsOptions, { params: { } }>>>();
    assert<Not<Equal<UpdateTodoParamsOptions, { params: { id?: string } }>>>();

    assert<Equal<UpdateTodoParamsOptions, { params: { id: string } }>>();

    type UpdateTodoBody = {
      title: string;
      isCompleted?: boolean;
    }

    type UpdateTodoBodyOptions = FetchBodyOptions<UpdateTodoBody>;
    assert<Not<Equal<UpdateTodoBodyOptions, {}>>>();
    assert<Not<Equal<UpdateTodoBodyOptions, { body: { } }>>>();
    assert<Not<Equal<UpdateTodoBodyOptions, { body: { title?: string } }>>>();

    assert<Equal<UpdateTodoBodyOptions, { body: { title: string } }>>();
    assert<Equal<UpdateTodoBodyOptions, { body: { title: string; isCompleted?: boolean } }>>();
  });
});

describe('TypePointClientResponseError', () => {
  it('should include status code and status text if response provided', () => {
    expect(new TypePointClientResponseError('Bad Request', partialOf<TypePointClientResponse<any>>({
      statusCode: 400,
      statusText: 'Bad Request',
    }))).toMatchObject({
      message: 'Bad Request',
      statusCode: 400,
      statusText: 'Bad Request',
    });
  });

  it('should not include status code and status text if response not provided', () => {
    expect(new TypePointClientResponseError('Bad Request', undefined)).toMatchObject({
      message: 'Bad Request',
      statusCode: undefined,
      statusText: undefined,
    });
  });
});
