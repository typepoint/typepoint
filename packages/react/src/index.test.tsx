/* eslint-disable max-classes-per-file */
import * as React from 'react';
import { TypePointClient, TypePointClientResponseError } from '@typepoint/client';
import { defineEndpoint, Empty, EndpointDefinition } from '@typepoint/shared';
import { getTodos, Todo } from '@typepoint/fixtures';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import {
  MissingTypePointProvider, TypePointProvider, useEndpoint, useEndpointLazily,
} from './index';

const { useCallback, useState } = React;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const delay = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

describe('useEndpoint', () => {
  class GetTodosRequestParams {
    filter?: 'all' | 'active' | 'completed';
  }

  let client: TypePointClient;
  let todos: Todo[];
  let getTodosEndpoint: EndpointDefinition<GetTodosRequestParams, Empty, Todo[]>;
  let TodoList: () => JSX.Element;

  beforeEach(() => {
    todos = getTodos();
    getTodosEndpoint = defineEndpoint((path) => path.literal('api/todos'));

    client = new TypePointClient();
    jest.spyOn(client, 'fetch').mockResolvedValue({
      statusCode: 200,
      statusText: 'OK',
      headers: {},
      header: jest.fn().mockReturnValue(''),
      body: todos,
    });

    // eslint-disable-next-line func-names
    TodoList = function () {
      const {
        response, refetch, loading, error,
      } = useEndpoint(getTodosEndpoint, {
        params: {
          filter: 'all',
        },
      });

      // eslint-disable-next-line no-shadow
      const todos = response ? response.body : [];

      if (loading) {
        return <p>Loading...</p>;
      }

      if (error) {
        return (
          <p data-testid="error-message">
            Error:
            {' '}
            {error.message || error }
          </p>
        );
      }

      return (
        <div>
          <button type="button" data-testid="refresh" onClick={refetch}>Refresh</button>
          <ul>
            { todos.map((todo) => (<li data-testid="todo" key={todo.id}>{todo.title}</li>)) }
          </ul>
        </div>
      );
    };

    jest.spyOn(console, 'error').mockImplementation(noop);
  });

  it('should error if no TypePointProvider has been used further up the component tree', () => {
    expect(() => render(<TodoList />)).toThrow(new MissingTypePointProvider());
  });

  it('should call endpoint and return response', async () => {
    const { findAllByTestId } = render(
      <TypePointProvider client={client}>
        <TodoList />
      </TypePointProvider>,
    );

    const todoElements = await findAllByTestId('todo');
    expect(todoElements.length).toEqual(getTodos().length);

    expect(client.fetch).toHaveBeenCalledWith(getTodosEndpoint, {
      params: {
        filter: 'all',
      },
    });
    expect(client.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call endpoint again when calling refetch', async () => {
    const { findAllByTestId, getByTestId } = render(
      <TypePointProvider client={client}>
        <TodoList />
      </TypePointProvider>,
    );

    expect(client.fetch).toHaveBeenCalledWith(getTodosEndpoint, {
      params: {
        filter: 'all',
      },
    });
    expect(client.fetch).toHaveBeenCalledTimes(1);

    const todoElements = await findAllByTestId('todo');
    expect(todoElements.length).toEqual(getTodos().length);

    const refreshButton = getByTestId('refresh');
    fireEvent.click(refreshButton);

    expect(client.fetch).toHaveBeenCalledTimes(2);
  });

  it('should return loading state', async () => {
    jest.spyOn(client, 'fetch').mockImplementation(() => delay(100).then(() => ({
      statusCode: 200,
      statusText: 'OK',
      headers: {},
      header: jest.fn().mockReturnValue(''),
      body: todos,
    })));

    const { findByText } = render(
      <TypePointProvider client={client}>
        <TodoList />
      </TypePointProvider>,
    );

    await expect(findByText('Loading...')).resolves.toBeTruthy();

    await delay(200);

    await expect(findByText('Loading...')).rejects.toBeTruthy();
  });

  it('should return any error from endpoint', async () => {
    jest.spyOn(client, 'fetch').mockRejectedValue(new Error('Computer says no'));

    const { findByText } = render(
      <TypePointProvider client={client}>
        <TodoList />
      </TypePointProvider>,
    );

    expect(client.fetch).toHaveBeenCalledWith(getTodosEndpoint, {
      params: {
        filter: 'all',
      },
    });
    expect(client.fetch).toHaveBeenCalledTimes(1);

    const errorElement = await findByText(/Error:\s+Computer says no/);
    expect(errorElement).toBeTruthy();
  });

  describe('response handlers', () => {
    beforeEach(() => {
      // eslint-disable-next-line func-names
      TodoList = function () {
        // eslint-disable-next-line no-shadow
        const [todos, setTodos] = useState<Todo[]>([]);
        const [error, setError] = useState<Error | any>();

        const { refetch, loading } = useEndpoint(getTodosEndpoint, {
          params: {
            filter: 'all',
          },
          onSuccess: ({ body }) => setTodos(body),
          onFailure: (err) => setError(err),
        });

        if (loading) {
          return <p>Loading...</p>;
        }

        if (error) {
          return (
            <p data-testid="error-message">
              Error:
              {' '}
              {error.message || error }
            </p>
          );
        }

        return (
          <div>
            <button type="button" data-testid="refresh" onClick={refetch}>Refresh</button>
            <ul>
              { todos.map((todo) => (<li data-testid="todo" key={todo.id}>{todo.title}</li>)) }
            </ul>
          </div>
        );
      };

      jest.spyOn(console, 'error').mockImplementation(noop);
    });

    it('should call onSuccess handler', async () => {
      const { findAllByTestId, queryByTestId } = render(
        <TypePointProvider client={client}>
          <TodoList />
        </TypePointProvider>,
      );

      const todoElements = await findAllByTestId('todo');
      expect(todoElements.length).toEqual(getTodos().length);

      expect(queryByTestId('error-message')).toBeFalsy();

      expect(client.fetch).toHaveBeenCalledWith(getTodosEndpoint, {
        params: {
          filter: 'all',
        },
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function),
      });
      expect(client.fetch).toHaveBeenCalledTimes(1);
    });

    it('should call onFailure handler', async () => {
      jest.spyOn(client, 'fetch').mockRejectedValue(new TypePointClientResponseError('Internal Server Error', {
        body: null,
        statusCode: 500,
        statusText: 'Internal Server Error',
        header: jest.fn().mockReturnValue(''),
        headers: {},
      }));

      const { queryByTestId, queryAllByTestId } = render(
        <TypePointProvider client={client}>
          <TodoList />
        </TypePointProvider>,
      );

      await waitFor(async () => {
        const todoElements = await queryAllByTestId('todo');
        expect(todoElements.length).toEqual(0);
        expect(queryByTestId('error-message')).toBeTruthy();
      });

      expect(client.fetch).toHaveBeenCalledWith(getTodosEndpoint, {
        params: {
          filter: 'all',
        },
        onSuccess: expect.any(Function),
        onFailure: expect.any(Function),
      });
      expect(client.fetch).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useEndpointLazily', () => {
  class SubscribeRequestBody {
    email!: string;
  }

  let client: TypePointClient;
  let subscribeEndpoint: EndpointDefinition<Empty, SubscribeRequestBody, Empty>;
  let SubscribeToNewsletter: () => JSX.Element;

  beforeEach(() => {
    subscribeEndpoint = defineEndpoint((path) => path.literal('api/subscribe'));

    client = new TypePointClient();
    jest.spyOn(client, 'fetch').mockResolvedValue({
      statusCode: 200,
      statusText: 'OK',
      headers: {},
      header: jest.fn().mockReturnValue(''),
      body: {},
    });

    // eslint-disable-next-line func-names
    SubscribeToNewsletter = function () {
      const [email, setEmail] = useState('');
      const [error, setError] = useState<any>(null);
      const [subscribed, setSubscribed] = useState(false);

      const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
      }, [setEmail]);

      const { fetch } = useEndpointLazily(subscribeEndpoint);

      const handleSubmit = useCallback(async () => {
        try {
          const { statusCode } = await fetch().promise();
          setSubscribed(statusCode === StatusCodes.OK);
        } catch (err) {
          setError(err);
        }
      }, [fetch]);

      if (error) {
        return (
          <p data-testid="error-message">
            {`Error: ${error.message || error}`}
          </p>
        );
      }

      if (subscribed) {
        return <p data-testid="subscribed">Thanks for subscribing!</p>;
      }

      return (
        <div>
          <input id="email" name="email" data-testid="email" value={email} onChange={handleEmailChange} />
          <button type="button" data-testid="submit" onClick={handleSubmit}>Submit</button>
        </div>
      );
    };

    jest.spyOn(console, 'error').mockImplementation(noop);
  });

  it('should allow waiting on promise that resolves', async () => {
    const { getByTestId, queryByTestId } = render(
      <TypePointProvider client={client}>
        <SubscribeToNewsletter />
      </TypePointProvider>,
    );
    const emailInput = getByTestId('email');
    fireEvent.change(emailInput, { target: { value: 'joe@example.com' } });

    const submitButton = getByTestId('submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(queryByTestId('subscribed')).toBeTruthy();
    });
  });

  it('should allow waiting on promise that rejects', async () => {
    jest.spyOn(client, 'fetch').mockRejectedValue({
      message: 'Bad Request',
      response: {
        statusCode: 400,
        statusText: getReasonPhrase(400),
        headers: {},
        header: jest.fn().mockReturnValue(''),
        body: {},
      },
    });

    const { getByTestId, queryByTestId } = render(
      <TypePointProvider client={client}>
        <SubscribeToNewsletter />
      </TypePointProvider>,
    );

    const submitButton = getByTestId('submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(queryByTestId('subscribed')).toBeFalsy();
      expect(queryByTestId('error-message')).toBeTruthy();
    });
  });

  describe('response handlers', () => {
    beforeEach(() => {
      // eslint-disable-next-line func-names
      SubscribeToNewsletter = function () {
        const [email, setEmail] = useState('');
        const [error, setError] = useState(null as Error | null);
        const [subscribed, setSubscribed] = useState(false);

        const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
          setEmail(event.target.value);
        }, [setEmail]);

        const { fetch: subscribe } = useEndpointLazily(subscribeEndpoint);

        const handleSubmit = useCallback(async () => {
          subscribe({
            body: { email },
            onSuccess: ({ statusCode }) => {
              setSubscribed(statusCode === StatusCodes.OK);
            },
            onFailure: setError,
          });
        }, [email, setError, setSubscribed, subscribe]);

        if (error) {
          return (
            <p data-testid="error-message">
              {`Error: ${error.message || error}`}
            </p>
          );
        }

        if (subscribed) {
          return <p data-testid="subscribed">Thanks for subscribing!</p>;
        }

        return (
          <div>
            <input id="email" name="email" data-testid="email" value={email} onChange={handleEmailChange} />
            <button type="button" data-testid="submit" onClick={handleSubmit}>Submit</button>
          </div>
        );
      };
    });

    it('should call onSuccess handler', async () => {
      jest.spyOn(client, 'fetch').mockResolvedValue({
        statusCode: 200,
        statusText: getReasonPhrase(200),
        headers: {},
        header: jest.fn().mockReturnValue(''),
        body: {},
      });

      const { getByTestId, queryByTestId } = render(
        <TypePointProvider client={client}>
          <SubscribeToNewsletter />
        </TypePointProvider>,
      );

      const emailInput = getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'joe@example.com' } });

      const submitButton = getByTestId('submit');
      fireEvent.click(submitButton);

      await waitFor(async () => {
        expect(client.fetch).toHaveBeenCalledTimes(1);

        await waitFor(() => {
          expect(queryByTestId('subscribed')).toBeTruthy();
          expect(queryByTestId('error-message')).toBeFalsy();
        });
      });
    });

    it('should call onFailure handler', async () => {
      jest.spyOn(client, 'fetch').mockRejectedValue({
        message: 'Bad Request',
        response: {
          statusCode: 400,
          statusText: getReasonPhrase(400),
          headers: {},
          header: jest.fn().mockReturnValue(''),
          body: {},
        },
      });

      const { getByTestId, queryByTestId } = render(
        <TypePointProvider client={client}>
          <SubscribeToNewsletter />
        </TypePointProvider>,
      );

      const emailInput = getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'joe' } });

      const submitButton = getByTestId('submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(queryByTestId('subscribed')).toBeFalsy();
        expect(queryByTestId('error-message')).toBeTruthy();
      });
    });
  });
});
