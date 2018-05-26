import { expect } from 'chai';

import { Logger, NoopLogger } from './logger';

describe('shared/logger', () => {
  describe('NoopLogger', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new NoopLogger();
    });

    it('should have a log method', () => {
      expect(logger).to.have.property('log').that.is.a('function');
    });

    it('should have a debug method', () => {
      expect(logger).to.have.property('debug').that.is.a('function');
    });

    it('should have an info method', () => {
      expect(logger).to.have.property('info').that.is.a('function');
    });

    it('should have a warn method', () => {
      expect(logger).to.have.property('warn').that.is.a('function');
    });

    it('should have an error method', () => {
      expect(logger).to.have.property('error').that.is.a('function');
    });
  });
});
