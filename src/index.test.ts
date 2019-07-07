describe('typepoint', () => {
  it('should throw error if required directly', function() {
    expect(() => require('./')).toThrow(
      `Do not import from/require \'@typepoint/core\' directly. ` +
      `Instead import from/require \'@typepoint/core/client\', \'@typepoint/core/shared\' or \'@typepoint/core/server\'`
    );
  });
});
