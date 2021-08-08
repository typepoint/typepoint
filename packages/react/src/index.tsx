import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  Empty,
  EndpointDefinition,
  GetEndpointDefinitionResponseBody,
} from '@typepoint/shared';
import {
  EndpointDefinitionWithNoParamsOrBody,
  TypePointClient,
  TypePointClientFetchOptions,
  TypePointClientResponse,
  TypePointClientResponseError,
} from '@typepoint/client';
import { parse, stringify } from './json';

function notNil<T>(value: T): Exclude<T, undefined | null> {
  // istanbul ignore next
  if (value === null || value === undefined) {
    // istanbul ignore next
    throw new Error('Unexpected nil value');
  }

  return value as Exclude<T, undefined | null>;
}

export const TypePointContext = createContext(undefined as TypePointClient | undefined);

export interface TypePointProviderProps {
  children: React.ReactNode;
  client: TypePointClient;
}

export const TypePointProvider = ({ children, client }: TypePointProviderProps) => (
  <TypePointContext.Provider value={client}>
    {children}
  </TypePointContext.Provider>
);

export class MissingTypePointProvider extends Error {
  constructor() {
    // istanbul ignore next
    super('Cannot call useEndpoint or useEndpointLazily without wrapping component tree with TypePointProvider');
  }
}

export type FetchFunctionResult<TEndpointDefinition extends EndpointDefinition<any, any, any>> = {
  promise(): Promise<TypePointClientResponse<GetEndpointDefinitionResponseBody<TEndpointDefinition>>>;
}

export type FetchFunction<TEndpointDefinition extends EndpointDefinition<any, any, any>> = (
  TEndpointDefinition extends EndpointDefinitionWithNoParamsOrBody
    ? (options?: TypePointClientFetchOptions<TEndpointDefinition>) => FetchFunctionResult<TEndpointDefinition>
    : (options: TypePointClientFetchOptions<TEndpointDefinition>) => FetchFunctionResult<TEndpointDefinition>
);

export const useEndpointLazily = <TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  endpointDefinition: TEndpointDefinition,
) => {
  const context = useContext(TypePointContext);
  if (!context) {
    throw new MissingTypePointProvider();
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined as TypePointClientResponseError | undefined);
  const [response, setResponse] = useState(
    undefined as TypePointClientResponse<GetEndpointDefinitionResponseBody<TEndpointDefinition>> | undefined,
  );

  const fetch = useCallback(
    (options?: TypePointClientFetchOptions<TEndpointDefinition>) => {
      setLoading(true);
      setError(undefined);

      const promise = context
        .fetch(endpointDefinition, options)
        .then((res) => {
          setResponse(res);
          setLoading(false);
          return { res, err: undefined };
        })
        .catch((err: TypePointClientResponseError) => {
          setError(err);
          setResponse(err.response);
          setLoading(false);
          return { res: undefined, err };
        });

      return {
        promise: async () => promise.then(({ res, err }) => {
          if (err) {
            throw err;
          }
          return notNil(res);
        }),
      };
    }, [context, endpointDefinition],
  );

  const { statusCode, statusText, body } = response ?? {};

  const result = useMemo(() => ({
    fetch, loading, error, response, statusCode, statusText, body,
  }), [fetch, loading, error, response, statusCode, statusText, body]);

  return result;
};

interface UseEndpointFunctionResult<TResponseBody> {
  refetch: () => void;
  loading: boolean;
  error?: TypePointClientResponseError | undefined;
  response?: TypePointClientResponse<TResponseBody>;
  statusCode?: number;
  statusText?: string;
  body?: TResponseBody;
}

interface UseEndpointFunction {
  <TEndpointDefinition extends EndpointDefinition<Empty, Empty, any>>(
    endpointDefinition: TEndpointDefinition,
    options?: TypePointClientFetchOptions<TEndpointDefinition>,
  ): UseEndpointFunctionResult<GetEndpointDefinitionResponseBody<TEndpointDefinition>>;

  <TEndpointDefinition extends EndpointDefinition<any, any, any>>(
    endpointDefinition: TEndpointDefinition,
    options: TypePointClientFetchOptions<TEndpointDefinition>,
  ): UseEndpointFunctionResult<GetEndpointDefinitionResponseBody<TEndpointDefinition>>;
}

export const useEndpoint = (<TEndpointDefinition extends EndpointDefinition<any, any, any>>(
  endpointDefinition: TEndpointDefinition,
  options?: TypePointClientFetchOptions<TEndpointDefinition>,
) => {
  const {
    fetch, loading, error, response, statusCode, statusText, body,
  } = useEndpointLazily(endpointDefinition);

  const optionsString = stringify(options);

  const refetch = useCallback(
    () => fetch(parse(optionsString)),
    [fetch, optionsString],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const result = useMemo(() => ({
    refetch,
    loading,
    error,
    response,
    statusCode,
    statusText,
    body,
  }), [
    refetch,
    loading,
    error,
    response,
    statusCode,
    statusText,
    body,
  ]);

  return result;
}) as UseEndpointFunction;
