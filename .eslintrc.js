module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  'extends': [
    'eslint:recommended',
    // "plugin:vue/essential",
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  parser: 'vue-eslint-parser',
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    indent: [
      'error', 2, {
        SwitchCase: 1,
      },
    ],
    'linebreak-style': ['error', 'unix'],
    quotes: [
      'error', 'single', {
        allowTemplateLiterals: true,
      },
    ],
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
  },
}
