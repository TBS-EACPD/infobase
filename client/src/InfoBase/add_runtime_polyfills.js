const add_resize_observer_polyfill = () => {
  if (window.ResizeObserver === undefined) {
    return import("src/TextDiff/TextDiff.js").then(
      (ResizeObserver) => (window.ResizeObserver = ResizeObserver)
    );
  }
};

export const add_runtime_polyfills = () => {
  return Promise.all([add_resize_observer_polyfill]);
};
