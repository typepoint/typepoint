import { Request as ExpressRequest } from 'express';
import { partialOf } from 'jest-helpers';
import { Request as TypePointRequest, RequestCookies } from '@typepoint/server';
import { TypePointExpressRequest } from './typePointExpressRequest';

describe('server/express/typePointExpressRequest', () => {
  describe('TypePointExpressRequest', () => {
    describe('for an express get request', () => {
      let request: TypePointExpressRequest<any, any>;

      beforeEach(() => {
        const expressRequest = partialOf<ExpressRequest>({
          url: '/todos/1?format=html',
          method: 'get',
          query: {
            format: 'html',
          },
        });

        request = new TypePointExpressRequest(expressRequest);
      });

      it('should have correct method', () => {
        expect(request).toHaveProperty('method', 'GET');
      });

      it('should have correct url', () => {
        expect(request).toHaveProperty('url', '/todos/1?format=html');
      });

      it('should have correct params', () => {
        expect(request).toHaveProperty('params', {
          format: 'html',
        });
      });

      it('should have an empty body', () => {
        expect(request).toHaveProperty('body', undefined);
      });
    });

    describe('for an express put request', () => {
      let request: TypePointExpressRequest<any, any>;

      beforeEach(() => {
        const expressRequest = partialOf<ExpressRequest>({
          url: '/todos/1',
          method: 'put',
          query: {
            format: 'html',
          },
          body: {
            title: 'Convert the internet to TypeScript',
            isCompleted: false,
          },
        });

        request = new TypePointExpressRequest(expressRequest);
      });

      it('should have correct method', () => {
        expect(request).toHaveProperty('method', 'PUT');
      });

      it('should have correct url', () => {
        expect(request).toHaveProperty('url', '/todos/1');
      });

      it('should have correct body', () => {
        expect(request).toHaveProperty('body', {
          title: 'Convert the internet to TypeScript',
          isCompleted: false,
        });
      });
    });

    describe('for a request with headers', () => {
      let request: TypePointExpressRequest<any, any>;

      beforeEach(() => {
        const expressRequest = partialOf<ExpressRequest>({
          url: '/todos',
          method: 'get',
          header: jest.fn().mockReturnValue('en-AU,en'),
          headers: {
            'Accept-Language': 'en-AU,en',
            Referer: 'https://www.example.com',
          },
        });

        request = new TypePointExpressRequest(expressRequest);
      });

      it('should return a specific header', () => {
        expect(request.header('Accept-Language')).toBe('en-AU,en');
      });

      it('should return all headers', () => {
        expect(request.headers).toEqual({
          'Accept-Language': 'en-AU,en',
          Referer: 'https://www.example.com',
        });
      });
    });

    describe('for a request with cookies', () => {
      let request: TypePointExpressRequest<any, any>;
      let widgetEnabled: string;
      let sessionId: string;
      let cookies: RequestCookies;
      let signedCookies: RequestCookies;

      beforeEach(() => {
        sessionId = 'd219d446-3f9d-41cd-aadf-b534b1b5c774';
        widgetEnabled = 'true';
        cookies = {
          widgetEnabled,
        };
        signedCookies = {
          sessionId,
        };
        const expressRequest = partialOf<ExpressRequest>({
          url: '/todos',
          method: 'get',
          cookies,
          signedCookies,
        });
        request = new TypePointExpressRequest(expressRequest);
      });

      it('should return a specific cookie', () => {
        expect(request.cookie('widgetEnabled')).toBe(widgetEnabled);
      });

      it('should return undefined for a missing cookie', () => {
        expect(request.cookie('Oceanic Flight 815')).toBe(undefined);
      });

      it('should return all cookies', () => {
        expect(request.cookies).toEqual(cookies);
      });

      it('should return a specific signed cookie', () => {
        expect(request.signedCookie('sessionId')).toBe(sessionId);
      });

      it('should return undefined for a missing signed cookie', () => {
        expect(request.signedCookie('widgetEnabled')).toBe(undefined);
      });

      it('should return all signed cookies', () => {
        expect(request.signedCookies).toEqual(signedCookies);
      });
    });
  });
});
