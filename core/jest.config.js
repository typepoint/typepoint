module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts?(x)"
  ],
  coveragePathIgnorePatterns: [
    ".*\.d\.ts$"
  ],
  coverageDirectory: "coverage",
  globals: {
    "ts-jest": {
      "tsConfig": "./tsconfig.tests.json"
    }
  },
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
  setupFiles: [
    'reflect-metadata'
  ],
  testEnvironment: "node",
  testRegex: ["^.+\\.test\\.tsx?$"],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
};
