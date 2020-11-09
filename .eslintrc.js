module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
  },
  ignorePatterns: ['/dist'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier/@typescript-eslint',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      plugins: ['@typescript-eslint'],
    },
  ],
};
