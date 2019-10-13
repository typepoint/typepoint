import { Logger, NoopLogger } from './logger';

describe('shared/logger', () => {
  describe('NoopLogger', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new NoopLogger();
    });

    it('should have a log method', () => {
      expect(logger).toHaveProperty('log', expect.any(Function));
    });

    it('should have a debug method', () => {
      expect(logger).toHaveProperty('debug', expect.any(Function));
    });

    it('should have an info method', () => {
      expect(logger).toHaveProperty('info', expect.any(Function));
    });

    it('should have a warn method', () => {
      expect(logger).toHaveProperty('warn', expect.any(Function));
    });

    it('should have an error method', () => {
      expect(logger).toHaveProperty('error', expect.any(Function));
    });
  });
});
