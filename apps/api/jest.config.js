module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client/index.js',
  },
};
