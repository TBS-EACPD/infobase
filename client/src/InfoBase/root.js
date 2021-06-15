import { start_spinner } from "src/components/LeafSpinner/pre_react_leaf_spinner";

const stop_spinner = start_spinner();

import("./runtime_polyfills")
  .then(({ runtime_polyfills }) => runtime_polyfills())
  .then(() =>
    Promise.all([import("./bootstrapper"), import("./App")]).then(
      ([{ bootstrapper }, { App, app_reducer }]) =>
        bootstrapper(App, app_reducer, stop_spinner)
    )
  );
