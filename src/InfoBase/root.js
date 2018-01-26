require('../bootstrap/include_common.js');
require('../../external-dependencies/spin.min.exec.js');

$(()=>{
  const app_el =document.querySelector('#app');
  const spinner =  new Spinner({scale:4});
  spinner.spin(app_el)
  app_el.setAttribute('aria-busy', 'true');

  require.ensure(['./InfoBase.js'],()=> {
    const start = require('./InfoBase.js');
    start({app_el, spinner}); 
  });
});