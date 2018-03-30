import { expect } from 'chai';
import { Response as ExpressResponse } from 'express';
import * as httpStatusCodes from 'http-status-codes';
import * as sinon from 'sinon';
import 'sinon-chai';

import { Response as StrongPointResponse, SetCookieOptions } from '../../server';
import { StrongPointExpressResponse } from './strongPointExpressResponse';

import partialMockOf from '../../../tests/infrastructure/mockOf';
import { Product } from '../../../tests/fixtures';
import * as fixtures from '../../../tests/fixtures';

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
        cookie: sinon.spy(),
        clearCookie: sinon.spy(),
        flushHeaders: sinon.spy(),
        headersSent: false,
        sendStatus: sinon.spy(),
        send: sinon.spy(),
        getHeader: sinon.stub().returns('some header value'),
        getHeaders: sinon.stub().returns({
          'some-header-name': 'some-header-value',
          'another-header-name': 'another-header-value'
        }),
        setHeader: sinon.spy(),
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

    it('should get header from express response using header(name)', () => {
      const actual = response.header('some-header-name');
      expect(actual).to.equal('some header value');
    });

    it('should set header in express response using header(name, value)', () => {
      response.header('some-header-name', 'some-header-value');
      expect(expressResponse.setHeader).to.have.been.calledWith('some-header-name', 'some-header-value');
    });

    it('should remove header in express response when calling header(name, undefined)', () => {
      response.header('some-header-name', undefined);
      expect(expressResponse.removeHeader).to.have.been.calledWith('some-header-name');
    });

    it('should get list of all headers from express response', () => {
      const actual = response.headers();
      expect(expressResponse.getHeaders).to.have.been.called;
      expect(actual).to.deep.equal({
        'some-header-name': 'some-header-value',
        'another-header-name': 'another-header-value'
      });
    });

    it('should set cookie in express response', () => {
      const cookieName = 'widgetEnabled';
      const cookieValue = 'true';
      const cookieOptions: SetCookieOptions = {
        maxAge: 1000 * 60 * 60 * 30
      };
      response.cookie(cookieName, cookieValue, cookieOptions);
      expect(expressResponse.cookie).to.have.been.calledWith(cookieName, cookieValue, cookieOptions);
    });

    it('should clear cookie in express response', () => {
      const cookieName = 'widgetEnabled';
      const cookieOptions: SetCookieOptions = {
        maxAge: 1000 * 60 * 60 * 30
      };
      response.clearCookie(cookieName, cookieOptions);
      expect(expressResponse.clearCookie).to.have.been.calledWith(cookieName, cookieOptions);
    });
  });
});
