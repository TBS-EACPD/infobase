// Important reminder: this file produces the app entry point JS, and it will never be cached by users
// It should be the absolute minimum to start a spinner and then load the further polyfills and app code afterwards

// minimal polyfils to support further dynamic imports (converted to promises by webpack), all other polyfilling done post-spinner
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/es.promise";

import "src/components/LeafSpinner/LeafSpinner.scss";
import leaf_loading_spinner from "src/components/LeafSpinner/LeafSpinner.svg";

// Important reminder: this initial spinner setup is pre-pollyfilling! Keep it portable
const spinner_container = document.createElement("div");
spinner_container.className = "leaf-spinner-container";
spinner_container.setAttribute("style", "transform: scale(2); position: fixed");
spinner_container.innerHTML = leaf_loading_spinner;

const app_el = document.querySelector("#app");
app_el.appendChild(spinner_container);
app_el.setAttribute("aria-busy", "true");

const stop_spinner = () => {
  app_el.removeChild(spinner_container);
  app_el.removeAttribute("aria-busy");
};

import("./core_polyfills.side-effects")
  .then(() =>
    import("./dynamic_polyfills").then(({ dynamic_polyfills }) =>
      dynamic_polyfills()
    )
  )
  .then(() =>
    Promise.all([import("./bootstrapper"), import("./App")]).then(
      ([{ bootstrapper }, { App }]) => bootstrapper(App, stop_spinner)
    )
  );
