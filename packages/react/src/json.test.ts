import { parse, stringify } from './json';

describe('stringify', () => {
  it('should stringify a defined value', () => {
    expect(stringify({ name: 'Joe' })).toEqual('{"name":"Joe"}');
  });

  it('should return an empty string if value is undefined', () => {
    expect(stringify(undefined)).toEqual('');
  });
});

describe('parse', () => {
  it('should parse a valid JSON string', () => {
    expect(parse('{ "name": "Joe" }')).toEqual({ name: 'Joe' });
  });

  it('should return undefined if string is empty', () => {
    expect(parse('')).toEqual(undefined);
  });
});
