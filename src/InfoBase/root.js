import pre_load from './pre_load';

$(()=>{
  const kill_spinner = pre_load();
  window.is_a11y_mode = false;
  require.ensure(['./App.js', './bootstrap.js'],()=> {
    const bootstrap = require('./bootstrap.js');
    const { App, app_reducer } = require("./App.js")
    bootstrap(App, app_reducer, kill_spinner);
  });
});