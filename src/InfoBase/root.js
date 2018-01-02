require('../bootstrap/include_common.js');
require('../../external-dependencies/spin.min.exec.js');

function setup_skip_to_main_content(){
  d4.select(document.querySelector('#app')).attr('tabindex', "-1");
  d4.select(document.querySelector('#skip-nav'))
    .on("click", () => {
      d4.event.preventDefault(); 
      d4.event.stopPropagation();
      const el = document.querySelector('#app')
      el && el.focus(); 
    });
}

$(()=>{
  setup_skip_to_main_content();
  const app_el =document.querySelector('#app');
  const spinner =  new Spinner({scale:4});
  spinner.spin(app_el)
  app_el.setAttribute('aria-busy', 'true');

  require.ensure(['./InfoBase.js'],()=> {
    const start = require('./InfoBase.js');
    start({app_el, spinner}); 
  });
})
