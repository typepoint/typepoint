import { expect } from 'chai';

describe('strongpoint', () => {
  it('should throw error if required directly', () => {
    expect(() => require('../../index')).to.throw(
      `Do not import from/require \'strongpoint\' directly. ` +
      `Instead import from/require \'strongpoint/client\', \'strongpoint/shared\' or \'strongpoint/server\'`
    );
  });
});
