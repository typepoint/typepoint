import { expect } from 'chai';
import * as sinon from 'sinon';

import { BasicConsole, warnIfWindowDetected } from '../../../../server/clientDetection';

describe('server/clientDetection', () => {
  describe('warnIfWindowDetected', () => {
    let console: BasicConsole;
    const warning = `It appears you've referenced 'strongpoint/server' in your client side code (window detected)`;

    it('should warn in console when window is present', () => {
      console = {
        warn: sinon.spy(),
        log: sinon.spy(),
      };
      warnIfWindowDetected({}, console);
      expect(console.warn).to.have.been.calledWith(warning);
      expect(console.log).not.to.have.been.called;
    });

    it('should use console.log when console.warn is not available', () => {
      console = { log: sinon.spy() };
      warnIfWindowDetected({}, console);
      expect(console.log).to.have.been.calledWith(warning);
    });

    it('should not warn in console when window is not present', () => {
      console = {
        warn: sinon.spy(),
        log: sinon.spy(),
      };
      warnIfWindowDetected(undefined, console);
      expect(console.warn).not.to.have.been.called;
      expect(console.log).not.to.have.been.called;
    });
  });
});
