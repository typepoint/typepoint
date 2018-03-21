import { expect } from 'chai';

describe('strongpoint', () => {
  it('should throw error if required directly', function () {
    // Allow a bit more time for test to require module on demand
    // (may involve just in time transpilation)
    this.timeout(3000);

    expect(() => require('../../../index')).to.throw(
      `Do not import from/require \'strongpoint\' directly. ` +
      `Instead import from/require \'strongpoint/client\', \'strongpoint/shared\' or \'strongpoint/server\'`
    );
  });
});
