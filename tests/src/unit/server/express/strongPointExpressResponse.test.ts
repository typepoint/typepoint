import { expect } from 'chai';
import { Response as ExpressResponse } from 'express';
import * as httpStatusCodes from 'http-status-codes';
import * as sinon from 'sinon';
import 'sinon-chai';

import { Response as StrongPointResponse } from '../../../../../src/server';
import { StrongPointExpressResponse } from '../../../../../src/server/express/strongPointExpressResponse';

import partialMockOf from '../../../../infrastructure/mockOf';
import { Product } from '../../../../fixtures';
import * as fixtures from '../../../../fixtures';

type ResponseBody<TBody> = (
  {
    error: {
      code: string;
      message: string;
    }
  } | {
    body: TBody;
  }
);

describe('server/express/strongPointExpressResponse', () => {
  describe('StrongPointExpressResponse', () => {
    let expressResponse: ExpressResponse;
    let response: StrongPointResponse<ResponseBody<Product>>;
    let products: Product[];

    beforeEach(() => {
      expressResponse = partialMockOf<ExpressResponse>({
        flushHeaders: sinon.spy(),
        headersSent: false,
        sendStatus: sinon.spy(),
        send: sinon.spy(),
        get: sinon.stub().returns('some header value'),
        set: sinon.spy(),
        removeHeader: sinon.spy()
      });

      response = new StrongPointExpressResponse(expressResponse);

      products = fixtures.getProducts();
    });

    it('should create a StrongPoint response from an Express response', () => {
      expect(response).to.not.be.undefined;
    });

    it('should have an undefined status code by default', () => {
      expect(response.statusCode).to.be.undefined;
    });

    it('should automatically set the statusCode to 200 when setting body', () => {
      response.body = { body: products[0] };
      expect(response.statusCode).to.equal(httpStatusCodes.OK);
    });

    it('should not change the statusCode when setting body if statusCode had already been set', () => {
      response.statusCode = httpStatusCodes.NOT_FOUND;
      response.body = {
        error: {
          code: 'PRODUCT_DISCONTINUED',
          message: 'Product is no longer available'
        }
      };
      expect(response.statusCode).to.equal(httpStatusCodes.NOT_FOUND);
    });

    it('should send headers when flushHeaders is called for first time', () => {
      response.flushHeaders();
      expect(expressResponse.flushHeaders).to.have.been.called;
    });

    it('should not send headers if express already sent headers', () => {
      expressResponse.headersSent = true;
      response.flushHeaders();
      expect(expressResponse.flushHeaders).not.to.have.been.called;
    });

    it('should get headers from express response using headers.get(name)', () => {
      const actual = response.headers.get('some-header-name');
      expect(actual).to.equal('some header value');
    });

    it('should get headers from express response using headers(name)', () => {
      const actual = response.headers('some-header-name');
      expect(actual).to.equal('some header value');
    });

    it('should set headers in express response using headers.set(name, value)', () => {
      response.headers.set('some-header-name', 'some value');
      expect(expressResponse.set).to.have.been.calledWith('some-header-name', 'some value');
    });

    it('should set headers in express response using headers(name, value)', () => {
      response.headers('some-header-name', 'some value');
      expect(expressResponse.set).to.have.been.calledWith('some-header-name', 'some value');
    });

    it('should remove headers from express response', () => {
      response.headers.remove('some-header-name');
      expect(expressResponse.removeHeader).to.have.been.calledWith('some-header-name');
    });

    it('should remove headers from express response using headers.set(name, undefined)', () => {
      response.headers.set('some-header-name', undefined);
      expect(expressResponse.removeHeader).to.have.been.calledWith('some-header-name');
    });
  });
});
