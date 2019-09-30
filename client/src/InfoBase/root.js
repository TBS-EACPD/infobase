import pre_load from './pre_load.js';

const kill_spinner = pre_load();
import(/* webpackChunkName: "app_bootstrap" */ '../app_bootstrap/bootstrap.js').then( ({bootstrap}) => {
  import(/* webpackChunkName: "App" */ './App.js').then( ({App, app_reducer }) => {
    bootstrap(App, app_reducer, kill_spinner);
  });
});