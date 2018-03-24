import { expect } from 'chai';
import { defineEndpoint } from '../../../src/shared';

describe('shared', () => {
  describe('defineEndpoint', () => {
    it('should return an endpoint definition with the specified method and path', () => {
      const method = 'POST';
      const path = '/products';
      const getProducts = defineEndpoint(method, path);

      expect(getProducts).to.not.be.null;
      expect(getProducts).to.have.property('method', method);
      expect(getProducts).to.have.property('path', path);
    });

    it('should default a GET method if method is not specified', () => {
      const path = '/products';
      const getProducts = defineEndpoint(path);

      expect(getProducts).to.not.be.null;
      expect(getProducts).to.have.property('method', 'GET');
      expect(getProducts).to.have.property('path', path);
    });

    it('should error if method is not supported', () => {
      const method = 'SQUANCH';
      const path = '/products';
      expect(() => defineEndpoint(method as any, path)).to.throw('Unsupported HTTP method: SQUANCH');
    });

    it('should error when trying to reference typeInfo property', () => {
      const path = '/products';
      const getProducts = defineEndpoint(path);
      expect(() => getProducts.typeInfo).to.throw('Do not evaluate definition.typeInfo. It is reserved for internal use only.');
    })
  });
});
