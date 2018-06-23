import pre_load from './pre_load';

$(()=>{
  window.is_a11y_mode = true;
  const kill_spinner = pre_load();
  import('./bootstrap.js').then( ({bootstrap}) => {
    import('./A11Y_App.js').then( ({App, app_reducer }) => {
      bootstrap(App, app_reducer, kill_spinner);
    });
  });
});