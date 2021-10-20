import "core-js/stable/promise";

import { start_spinner } from "src/components/LeafSpinner/pre_react_leaf_spinner";

const stop_spinner = start_spinner();

Promise.all([
  import("./core_polyfills"),
  import("./dynamic_polyfills").then(({ dynamic_polyfills }) =>
    dynamic_polyfills()
  ),
]).then(() =>
  Promise.all([import("./bootstrapper"), import("./App")]).then(
    ([{ bootstrapper }, { App }]) => bootstrapper(App, stop_spinner)
  )
);
