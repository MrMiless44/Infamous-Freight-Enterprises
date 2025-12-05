const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  {
    ignores: ["node_modules", ".next"],
  },
  compat.config({
    extends: ["next/core-web-vitals"],
  }),
];
