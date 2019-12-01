import { Logger, NoopLogger } from './logger';

describe('shared/logger', () => {
  describe('NoopLogger', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new NoopLogger();
    });

    it('should not log to console', () => {
      jest.spyOn(console, 'log');
      jest.spyOn(console, 'debug');
      jest.spyOn(console, 'info');
      jest.spyOn(console, 'warn');
      jest.spyOn(console, 'error');

      logger.log('Relax Morty');
      // eslint-disable-next-line no-console
      expect(console.log).not.toHaveBeenCalled();

      logger.debug('Relax Morty');
      // eslint-disable-next-line no-console
      expect(console.debug).not.toHaveBeenCalled();

      logger.info('Relax Morty');
      // eslint-disable-next-line no-console
      expect(console.info).not.toHaveBeenCalled();

      logger.warn('Relax Morty');
      // eslint-disable-next-line no-console
      expect(console.warn).not.toHaveBeenCalled();

      logger.error('Relax Morty');
      // eslint-disable-next-line no-console
      expect(console.error).not.toHaveBeenCalled();
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
