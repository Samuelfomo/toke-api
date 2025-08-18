module.exports = {
    env: {
        browser: false,
        es2021: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off',
        'import/order': [
            'warn',
            {
                groups: ['builtin', 'external', 'internal'],
                'newlines-between': 'always',
            },
        ],
    },
};