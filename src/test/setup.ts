import '@testing-library/jest-dom/vitest';
import { beforeAll } from 'vitest';

// Polyfill o mocks si aplica
beforeAll(() => {
  if (typeof window !== 'undefined' && !window.crypto.subtle) {
    // Basic crypto polyfill if needed in Node
  }
});
