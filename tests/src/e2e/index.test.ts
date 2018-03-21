import { expect } from 'chai';
import * as sinon from 'sinon';
import * as linq from 'linq';
import * as getPort from 'get-port';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as clone from 'clone';

import { defineEndpoint, Empty } from '../../../shared';
import { Router, EndpointHandler } from '../../../server';
import * as fixtures from '../../fixtures';
import { Product } from '../../fixtures';
import * as httpStatusCodes from 'http-status-codes';
import { toMiddleware } from '../../../server/express';
import StrongPointClient from '../../../client';

describe('e2e/Sample Application', () => {
  let products: Product[];
  let server: http.Server;
  let app: express.Application;
  let port: number;
  let serverAddress: string;
  let client: StrongPointClient;

  const getProducts = defineEndpoint<Empty, Empty, Product[]>('/products');
  const getProduct = defineEndpoint<{ id: string }, Empty, Product>('/products/:id');
  const createProduct = defineEndpoint<Empty, Pick<Product, 'name' | 'url'>, Product>('POST', '/products');
  const updateProduct = defineEndpoint<{ id: string }, Pick<Product, 'name' | 'url'>, Product>('PUT', '/products/:id');
  const deleteProduct = defineEndpoint<{ id: string }, Empty, Product>('DELETE', '/products/:id');

  class GetProductsHandler extends EndpointHandler {
    constructor() {
      super();

      this.define(getProducts, context => {
        context.response.body = products;
      });
    }
  }

  class GetProductHandler extends EndpointHandler {
    constructor() {
      super();

      this.define(getProduct, context => {
        const product = products.find(p => p.id === context.request.params.id);
        if (!product) {
          context.response.statusCode = httpStatusCodes.NOT_FOUND;
        } else {
          context.response.body = product;
        }
      });
    }
  }

  class CreateProductHandler extends EndpointHandler {
    constructor() {
      super();

      this.define(createProduct, context => {
        const getNextProductId = () => (linq.from(products).max(p => parseInt(p.id)) + 1).toString();
        const productToCreate = {
          id: getNextProductId(),
          name: context.request.body.name,
          url: context.request.body.url,
        } as Product;
        products.push(productToCreate);
        context.response.body = productToCreate;
      });
    }
  }

  class UpdateProductHandler extends EndpointHandler {
    constructor() {
      super();

      this.define(updateProduct, context => {
        const existingProduct = products.find(p => p.id === context.request.params.id);
        if (!existingProduct) {
          context.response.statusCode = httpStatusCodes.NOT_FOUND;
        } else {
          const updateToProduct = context.request.body;
          existingProduct.name = updateToProduct.name;
          existingProduct.url = updateToProduct.url;
          context.response.body = existingProduct;
        }
      });
    }
  }

  class DeleteProductHandler extends EndpointHandler {
    constructor() {
      super();

      this.define(deleteProduct, context => {
        const productIndex = products.findIndex(p => p.id === context.request.params.id);
        if (productIndex === -1) {
          context.response.statusCode = httpStatusCodes.NOT_FOUND;
        } else {
          products.splice(productIndex, 1);
          context.response.statusCode = httpStatusCodes.NO_CONTENT;
        }
      });
    }
  }

  beforeEach(async function () {
    // Give some time for server to spin up
    this.timeout(5000);

    products = fixtures.getProducts();

    const router = new Router({
      handlers: [
        GetProductsHandler,
        GetProductHandler,
        CreateProductHandler,
        UpdateProductHandler,
        DeleteProductHandler
      ]
    });
    const middleware = toMiddleware(router);

    app = express();
    app.use(bodyParser.json());
    app.use(middleware);

    port = await getPort();
    serverAddress = `http://localhost:${ port }`;

    server = http.createServer(app);

    await new Promise((resolve, reject) => {
      server.listen(port, (err: any) => err ? reject(err) : resolve());
    });

    client = new StrongPointClient({
      server: serverAddress
    });
  });

  afterEach(() => {
    server.close();
  });

  it('should get a product', async () => {
    const expectation = {
      id: '1',
      name: 'Plumbus',
      url: 'http://rickandmorty.wikia.com/wiki/Plumbus'
    };

    const actual = await client.fetch(getProduct, {
      params: {
        id: '1'
      }
    });

    expect(actual)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(actual)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(actual)
      .to.have.property('body')
      .that.deep.equals(expectation);
  });

  it('should get list of products', async () => {
    const expectation = clone(products);

    const actual = await client.fetch(getProducts);

    expect(actual)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(actual)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(actual)
      .to.have.property('body')
      .that.deep.equals(expectation);
  });

  it('should add a product', async () => {
    const name = 'Szechuan Chicken McNugget Sauce';
    const url = 'http://rickandmorty.wikia.com/wiki/Szechuan_Chicken_McNugget_Sauce';

    const expectedLength = products.length + 1;
    const id = `${ expectedLength }`;

    const response = await client.fetch(createProduct, {
      body: {
        name,
        url
      }
    });

    expect(response)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(response)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(response)
      .to.have.property('body')
      .that.deep.equals({
        id,
        name,
        url
      });

    expect(products).to.have.lengthOf(expectedLength);
  });

  it('should update product', async () => {
    const valuesToUpdate = {
      name: 'Plumbus',
      url: 'https://www.thinkgeek.com/product/ivns/'
    };

    const expectation = {
      ...valuesToUpdate,
      id: '1'
    };

    const actual = await client.fetch(updateProduct, {
      params: { id: '1' },
      body: valuesToUpdate
    });

    expect(actual)
      .to.have.property('statusCode')
      .that.deep.equals(200);

    expect(actual)
      .to.have.property('statusText')
      .that.deep.equals('OK');

    expect(actual)
      .to.have.property('body')
      .that.deep.equals(expectation);
  });

  it('should delete product', async () => {
    const id = '2';

    const expectedLength = products.length - 1;

    const actual = await client.fetch(deleteProduct, {
      params: {
        id
      }
    });

    expect(actual)
      .to.have.property('statusCode')
      .that.deep.equals(204);

    expect(actual)
      .to.have.property('statusText')
      .that.deep.equals('No Content');

    expect(actual)
      .to.have.property('body')
      .that.deep.equals('');

    expect(products).to.have.lengthOf(expectedLength);

    expect(products.some(p => p.id === id)).to.be.false;
  });
});
