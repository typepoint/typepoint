import { BasicConsole, warnIfWindowDetected } from './clientDetection';

describe('server/clientDetection', () => {
  describe('warnIfWindowDetected', () => {
    let console: BasicConsole;
    const warning = `It appears you've referenced '@typepoint/core/server' in your client side code (window detected)`;

    it('should warn in console when window is present', () => {
      console = {
        warn: jest.fn(),
        log: jest.fn(),
      };
      warnIfWindowDetected({}, console);
      expect(console.warn).toHaveBeenCalledWith(warning);
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should use console.log when console.warn is not available', () => {
      console = { log: jest.fn() };
      warnIfWindowDetected({}, console);
      expect(console.log).toHaveBeenCalledWith(warning);
    });

    it('should not warn in console when window is not present', () => {
      console = {
        warn: jest.fn(),
        log: jest.fn(),
      };
      warnIfWindowDetected(undefined, console);
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
