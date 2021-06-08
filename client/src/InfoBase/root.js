import pre_load from "./pre_load";

const kill_spinner = pre_load();
import("./runtime_polyfills").then(({ runtime_polyfills }) =>
  runtime_polyfills().then(() => {
    import("./bootstrapper").then(({ bootstrapper }) => {
      import("./App").then(({ App, app_reducer }) => {
        bootstrapper(App, app_reducer, kill_spinner);
      });
    });
  })
);
