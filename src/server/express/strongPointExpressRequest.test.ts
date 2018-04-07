import { expect } from 'chai';
import { Request as ExpressRequest } from 'express';
import * as sinon from 'sinon';

import { Request as StrongPointRequest, RequestCookies } from '../../server';
import { StrongPointExpressRequest } from './strongPointExpressRequest';

import partialMockOf from '../../../tests/infrastructure/mockOf';
import { Todo } from '../../../tests/api/models/todo';
import { ObjectOmit } from 'typelevel-ts';

describe('server/express/strongPointExpressRequest', () => {

  describe('StrongPointExpressRequest', () => {

    describe('for an express get request', () => {
      let request: StrongPointExpressRequest<any, any>;

      beforeEach(() => {
        const expressRequest = partialMockOf<ExpressRequest>({
          url: '/todos/1?format=html',
          method: 'get',
          query: {
            format: 'html'
          }
        });

        request = new StrongPointExpressRequest(expressRequest);
      });

      it('should have correct method', () => {
        expect(request).to.have.property('method', 'GET');
      });

      it('should have correct url', () => {
        expect(request).to.have.property('url', '/todos/1?format=html');
      });

      it('should have correct params', () => {
        expect(request).to.have.property('params').that.deep.equals({
          format: 'html'
        });
      });

      it('should have an empty body', () => {
        expect(request).to.have.property('body').that.equals(undefined);
      });
    });

    describe('for an express put request', () => {
      let request: StrongPointExpressRequest<any, any>;

      beforeEach(() => {
        const expressRequest = partialMockOf<ExpressRequest>({
          url: '/todos/1',
          method: 'put',
          query: {
            format: 'html'
          },
          body: {
            title: 'Convert the internet to TypeScript',
            isCompleted: false
          }
        });

        request = new StrongPointExpressRequest(expressRequest);
      });

      it('should have correct method', () => {
        expect(request).to.have.property('method', 'PUT');
      });

      it('should have correct url', () => {
        expect(request).to.have.property('url', '/todos/1');
      });

      it('should have correct body', () => {
        expect(request).to.have.property('body').that.deep.equals({
          title: 'Convert the internet to TypeScript',
          isCompleted: false
        });
      });
    });

    describe('for a request with headers', () => {
      let request: StrongPointExpressRequest<any, any>;

      beforeEach(() => {
        const expressRequest = partialMockOf<ExpressRequest>({
          url: '/todos',
          method: 'get',
          header: sinon.stub().returns('en-AU,en'),
          headers: {
            'Accept-Language': 'en-AU,en',
            'Referer': 'https://www.example.com'
          }
        });

        request = new StrongPointExpressRequest(expressRequest);
      });

      it('should return a specific header', () => {
        expect(request.header('Accept-Language')).to.equal('en-AU,en');
      });

      it('should return all headers', () => {
        expect(request.headers).to.deep.equal({
          'Accept-Language': 'en-AU,en',
          'Referer': 'https://www.example.com'
        });
      });
    });

    describe('for a request with cookies', () => {
      let request: StrongPointExpressRequest<any, any>;
      let widgetEnabled: string;
      let sessionId: string;
      let cookies: RequestCookies;
      let signedCookies: RequestCookies;

      beforeEach(() => {
        sessionId = 'd219d446-3f9d-41cd-aadf-b534b1b5c774';
        widgetEnabled = 'true'
        cookies = {
          widgetEnabled
        };
        signedCookies = {
          sessionId
        };
        const expressRequest = partialMockOf<ExpressRequest>({
          url: '/todos',
          method: 'get',
          cookies,
          signedCookies
        });
        request = new StrongPointExpressRequest(expressRequest);
      });

      it('should return a specific cookie', () => {
        expect(request.cookie('widgetEnabled')).to.equal(widgetEnabled);
      });

      it('should return undefined for a missing cookie', () => {
        expect(request.cookie('Oceanic Flight 815')).to.equal(undefined);
      });

      it('should return all cookies', () => {
        expect(request.cookies).to.deep.equal(cookies);
      });

      it('should return a specific signed cookie', () => {
        expect(request.signedCookie('sessionId')).to.equal(sessionId);
      });

      it('should return undefined for a missing signed cookie', () => {
        expect(request.signedCookie('widgetEnabled')).to.equal(undefined);
      });

      it('should return all signed cookies', () => {
        expect(request.signedCookies).to.deep.equal(signedCookies);
      });
    });

  });

});
