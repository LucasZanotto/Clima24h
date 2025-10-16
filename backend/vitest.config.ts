import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    isolate: false,
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  },
});
