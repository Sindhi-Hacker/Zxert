const expo = require('eslint-config-expo/flat');
module.exports = [
  { ignores: ['**/node_modules/**', '**/.expo/**', '**/dist/**'] },
  ...expo,
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
