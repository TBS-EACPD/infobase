import pre_load from "./pre_load";

const kill_spinner = pre_load();
import("./bootstrapper.js").then(({ bootstrapper }) => {
  import("./App.js").then(({ App, app_reducer }) => {
    bootstrapper(App, app_reducer, kill_spinner);
  });
});
