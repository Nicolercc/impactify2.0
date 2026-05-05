import "@testing-library/jest-dom/vitest";

// Next.js Image: render as a plain img in tests.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver =
  (globalThis as any).IntersectionObserver ||
  class {
    observe() {}
    disconnect() {}
    unobserve() {}
  };

