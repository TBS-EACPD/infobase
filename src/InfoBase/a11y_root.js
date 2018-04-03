import pre_load from './pre_load';

$(()=>{
  window.is_a11y_mode = true;
  const kill_spinner = pre_load();
  require.ensure(['./A11Y_App.js', './bootstrap.js'],()=> {
    const bootstrap = require('./bootstrap.js');
    const { App, app_reducer } = require("./A11Y_App.js")
    bootstrap(App, app_reducer, kill_spinner);
  });
});