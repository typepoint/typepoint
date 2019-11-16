module.exports = {
  clearMocks: true,
  collectCoverage: false,
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsConfig: './tsconfig.test.json',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'node',
  testRegex: ['^.+\\.test\\.tsx?$'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
