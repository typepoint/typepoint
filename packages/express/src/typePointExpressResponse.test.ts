import { Response as ExpressResponse } from 'express';
import { OK, NOT_FOUND } from 'http-status-codes';
import { partialOf } from 'jest-helpers';
import { getProducts, Product } from '@typepoint/fixtures';
import { Response as TypePointResponse, SetCookieOptions } from '@typepoint/server';
import { TypePointExpressResponse } from './typePointExpressResponse';

type ResponseBody<TBody> = (
  {
    error: {
      code: string;
      message: string;
    };
  } | {
    body: TBody;
  }
);

describe('server/express/typePointExpressResponse', () => {
  describe('TypePointExpressResponse', () => {
    let expressResponse: ExpressResponse;
    let response: TypePointResponse<ResponseBody<Product>>;
    let products: Product[];

    beforeEach(() => {
      expressResponse = partialOf<ExpressResponse>({
        clearCookie: jest.fn(),
        cookie: jest.fn(),
        contentType: jest.fn(),
        flushHeaders: jest.fn(),
        headersSent: false,
        json: jest.fn(),
        sendStatus: jest.fn(),
        send: jest.fn(),
        getHeader: jest.fn().mockReturnValue('some header value'),
        getHeaders: jest.fn().mockReturnValue({
          'some-header-name': 'some-header-value',
          'another-header-name': 'another-header-value',
        }),
        setHeader: jest.fn(),
        removeHeader: jest.fn(),
      });

      response = new TypePointExpressResponse(expressResponse);

      products = getProducts();
    });

    it('should create a TypePoint response from an Express response', () => {
      expect(response).toBeDefined();
    });

    it('should have an undefined status code by default', () => {
      expect(response.statusCode).toBeUndefined();
    });

    it('should automatically set the statusCode to 200 when setting body', () => {
      response.body = { body: products[0] };
      expect(response.statusCode).toBe(OK);
    });

    it('should not change the statusCode when setting body if statusCode had already been set', () => {
      response.statusCode = NOT_FOUND;
      response.body = {
        error: {
          code: 'PRODUCT_DISCONTINUED',
          message: 'Product is no longer available',
        },
      };
      expect(response.statusCode).toBe(NOT_FOUND);
    });

    it('should have a contentType of \'application/json\' by default', () => {
      expect(response.contentType).toBe('application/json');
    });

    it('should send body as json when content-type is \'application/json\'', () => {
      response.body = { body: products[0] };
      response.flush();
      expect(expressResponse.json).toHaveBeenCalledWith({ body: products[0] });
    });

    it('should not send body as json when content-type is not \'application/json\'', () => {
      const html = '<html><body>Hello World</body></html>';
      response.contentType = 'text/html';
      response.body = html as any;
      response.flush();
      expect(expressResponse.json).not.toHaveBeenCalled();
      expect(expressResponse.send).toHaveBeenCalled();
    });

    it('should send headers when flushHeaders is called for first time', () => {
      response.flushHeaders();
      expect(expressResponse.flushHeaders).toHaveBeenCalled();
    });

    it('should not send headers if express already sent headers', () => {
      expressResponse.headersSent = true;
      response.flushHeaders();
      expect(expressResponse.flushHeaders).not.toHaveBeenCalled();
    });

    it('should get header from express response using header(name)', () => {
      const actual = response.header('some-header-name');
      expect(actual).toBe('some header value');
    });

    it('should set header in express response using header(name, value)', () => {
      response.header('some-header-name', 'some-header-value');
      expect(expressResponse.setHeader).toHaveBeenCalledWith('some-header-name', 'some-header-value');
    });

    it('should remove header in express response when calling header(name, undefined)', () => {
      response.header('some-header-name', undefined);
      expect(expressResponse.removeHeader).toHaveBeenCalledWith('some-header-name');
    });

    it('should get list of all headers from express response', () => {
      const actual = response.headers();
      expect(expressResponse.getHeaders).toHaveBeenCalled();
      expect(actual).toEqual({
        'some-header-name': 'some-header-value',
        'another-header-name': 'another-header-value',
      });
    });

    it('should set cookie in express response', () => {
      const cookieName = 'widgetEnabled';
      const cookieValue = 'true';
      const cookieOptions: SetCookieOptions = {
        maxAge: 1000 * 60 * 60 * 30,
      };
      response.cookie(cookieName, cookieValue, cookieOptions);
      expect(expressResponse.cookie).toHaveBeenCalledWith(cookieName, cookieValue, cookieOptions);
    });

    it('should clear cookie in express response', () => {
      const cookieName = 'widgetEnabled';
      const cookieOptions: SetCookieOptions = {
        maxAge: 1000 * 60 * 60 * 30,
      };
      response.clearCookie(cookieName, cookieOptions);
      expect(expressResponse.clearCookie).toHaveBeenCalledWith(cookieName, cookieOptions);
    });
  });
});
