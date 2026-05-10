#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const apiPkg = JSON.parse(fs.readFileSync(path.join(root, 'apps/api/package.json'), 'utf8'));

const rootPrisma = rootPkg.devDependencies?.prisma;
const rootOverrideClient = rootPkg.overrides?.['@prisma/client'];
const apiPrisma = apiPkg.devDependencies?.prisma;
const apiClient = apiPkg.dependencies?.['@prisma/client'];

const expected = apiClient;
const values = [
  ['root devDependencies.prisma', rootPrisma],
  ['root overrides.@prisma/client', rootOverrideClient],
  ['api devDependencies.prisma', apiPrisma],
  ['api dependencies.@prisma/client', apiClient],
];

const mismatches = values.filter(([, value]) => value !== expected);

if (mismatches.length > 0) {
  console.error('Prisma version alignment check failed. Expected all versions to equal:', expected);
  for (const [name, value] of mismatches) {
    console.error(`- ${name}: ${value}`);
  }
  process.exit(1);
}

console.log('Prisma version alignment check passed:', expected);
