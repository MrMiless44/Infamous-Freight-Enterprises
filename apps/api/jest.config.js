const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^@prisma/client$': require.resolve('@prisma/client', {
      paths: [path.resolve(__dirname), path.resolve(__dirname, '..', '..')],
    }),
  },
};
