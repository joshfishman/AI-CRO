module.exports = {
  // Other Jest configurations...
  
  // Map Storybook imports to our stub file
  moduleNameMapper: {
    '^@storybook/react$': '<rootDir>/src/storybook-stub.ts',
    '^@storybook/addon-actions$': '<rootDir>/src/storybook-stub.ts',
  },
}; 