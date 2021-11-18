require("regenerator-runtime/runtime");
require("@testing-library/jest-dom");

// JSDOM hasn't implemented matchMedia yet, drop in a mock here
Object.defineProperty(window, "matchMedia", {
  /* eslint-disable no-undef */
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
