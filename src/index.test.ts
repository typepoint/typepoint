import { expect } from 'chai';

describe('typepoint', () => {
  it('should throw error if required directly', function() {
    // Allow a bit more time for test to require module on demand
    this.timeout(3000);

    expect(() => require('./')).to.throw(
      `Do not import from/require \'@typepoint/core\' directly. ` +
      `Instead import from/require \'@typepoint/core/client\', \'@typepoint/core/shared\' or \'@typepoint/core/server\'`
    );
  });
});
