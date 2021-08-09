import {
  getProducts, getTodos, Product, Todo,
} from '@typepoint/fixtures';
import { defineEndpoint, Empty } from '@typepoint/shared';
import { createHandler, createMiddleware } from '.';

export interface GetByIdParams {
  id: string
}

export const getDefinitionAndHandlerFixtures = () => {
  const getProductDefinition = defineEndpoint<GetByIdParams, Empty, Product>(
    'GET',
    (path) => path.literal('products').param('id'),
  );

  const getProductsDefinition = defineEndpoint<Empty, Empty, Product[]>(
    'GET',
    (path) => path.literal('products'),
  );

  const getProductsInStockDefinition = defineEndpoint<Empty, Empty, Product[]>(
    'GET',
    (path) => path.literal('products/in-stock'),
  );

  const getProductsOutOfStockDefinition = defineEndpoint<Empty, Empty, Product[]>(
    'GET',
    (path) => path.literal('products/out-of-stock'),
  );

  const getTodosDefinition = defineEndpoint<Empty, Empty, Todo[]>(
    'GET',
    (path) => path.literal('todos'),
  );

  const getTodoDefinition = defineEndpoint<GetByIdParams, Empty, Todo>(
    'GET',
    (path) => path.literal('todos').param('id'),
  );

  const requestLogger = createMiddleware(async (_context, next) => {
    next();
  });

  const getProductsInStockHandler = createHandler(getProductsInStockDefinition, async (context) => {
    context.response.body = getProducts().filter(({ stock }) => stock > 0);
  });

  const getProductsOutOfStockHandler = createHandler(getProductsOutOfStockDefinition, async (context) => {
    context.response.body = getProducts().filter(({ stock }) => stock <= 0);
  });

  const getProductHandler = createHandler(getProductDefinition, async (context) => {
    const product = getProducts().find(({ id }) => id === context.request.params.id);

    if (!product) {
      context.response.statusCode = 404;
      return;
    }

    context.response.body = product;
  });

  const getProductsHandler = createHandler(getProductsDefinition, async (context) => {
    context.response.body = getProducts();
  });

  const getTodoHandler = createHandler(getTodoDefinition, async (context) => {
    const todo = getTodos().find(({ id }) => id === context.request.params.id);

    if (!todo) {
      context.response.statusCode = 404;
      return;
    }

    context.response.body = todo;
  });

  const getTodosHandler = createHandler(getTodosDefinition, async (context) => {
    context.response.body = getTodos();
  });

  const middlewaresByName = {
    requestLogger,
  };

  const handlersByName = {
    getTodosHandler,
    getProductsInStockHandler,
    getProductsHandler,
    getProductHandler,
    getProductsOutOfStockHandler,
    getTodoHandler,
  };

  const middlewares = Object.values(middlewaresByName);
  const handlers = Object.values(handlersByName);

  return {
    handlers,
    handlersByName,
    middlewares,
    middlewaresByName,
  };
};
