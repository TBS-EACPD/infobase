import pre_load from "./pre_load.js";

// __DEV is a global namespace for surfacing utilities in the dev console
// NEVER access it in app code, only ever assign to it (and that sparingly)
// TODO: formalize it a bit more, disable it in prod
window.__DEV = {};

const kill_spinner = pre_load();
import("./bootstrapper.js").then(({ bootstrapper }) => {
  import("./App.js").then(({ App, app_reducer }) => {
    bootstrapper(App, app_reducer, kill_spinner);
  });
});
