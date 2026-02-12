import '@testing-library/jest-dom';

console.log('[Test Setup] Initializing frontend test environment...');

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock import.meta.env for Vite
(global as any).import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
  },
};

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  console.log('[Test Setup] localStorage cleared');
});

console.log('[Test Setup] Frontend test environment configured');
