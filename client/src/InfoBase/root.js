import pre_load from "./pre_load.js";

const kill_spinner = pre_load();
import("../app_bootstrap/bootstrap.js").then(({ bootstrap }) => {
  import("./App.js").then(({ App, app_reducer }) => {
    bootstrap(App, app_reducer, kill_spinner);
  });
});
