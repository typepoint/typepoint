import * as React from 'react';
import { TypePointClient } from '@typepoint/client';
import { defineEndpoint, Empty, EndpointDefinition } from '@typepoint/shared';
import { getTodos, Todo } from '@typepoint/fixtures';
import { render, fireEvent } from '@testing-library/react';
import * as httpStatusCodes from 'http-status-codes';
import {
  MissingTypePointProvider, TypePointProvider, useEndpoint, useEndpointLazily,
} from './index';

const { useCallback, useState } = React;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    TodoList = () => {
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

    jest.spyOn(console, 'error').mockImplementation(() => {});
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
});

describe('useEndpointLazily', () => {
  class LoginRequestBody {
    username!: string;

    password!: string;
  }

  let client: TypePointClient;
  let subscribeEndpoint: EndpointDefinition<Empty, LoginRequestBody, Empty>;
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

    SubscribeToNewsletter = () => {
      const [email, setEmail] = useState('');
      const [error, setError] = useState(null as Error | null);
      const [subscribed, setSubscribed] = useState(false);

      const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
      }, [setEmail]);

      const { fetch } = useEndpointLazily(subscribeEndpoint);

      const handleSubmit = useCallback(async () => {
        try {
          const { statusCode } = await fetch().promise();
          setSubscribed(statusCode === httpStatusCodes.OK);
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

    jest.spyOn(console, 'error').mockImplementation(() => {});
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

    await delay(200);

    expect(queryByTestId('subscribed')).toBeTruthy();
  });

  it('should allow waiting on promise that rejects', async () => {
    jest.spyOn(client, 'fetch').mockRejectedValue({
      message: 'Bad Request',
      response: {
        statusCode: 400,
        statusText: httpStatusCodes.getStatusText(400),
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

    await delay(200);

    expect(queryByTestId('subscribed')).toBeFalsy();
    expect(queryByTestId('error-message')).toBeTruthy();
  });
});
