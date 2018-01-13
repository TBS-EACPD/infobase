if(typeof APPLICATION_LANGUAGE !== "undefined"){
  window.lang = APPLICATION_LANGUAGE;
}
if(typeof SHA !== "undefined"){
  window.long_sha = SHA;
  window.sha = SHA.substr(0,7);
}
if(typeof PRE_PUBLIC_ACCOUNTS !== "undefined"){
  window.pre_public_accounts = PRE_PUBLIC_ACCOUNTS;
}



require('../common_css/site.scss');
require('../common_css/boostrap-fixes-extensions.scss');
require('../common_css/grid-system.scss');
require('../common_css/flexbox-grid.css');

//3rd party libraries injected into global scope
//note that these next few lines must be run before anything using lodash, handlebars, etc. 
window.accounting = require('accounting');
window.marked = require('marked');
window.Handlebars = require('handlebars/dist/cjs/handlebars.js').default;
window.React = require('react');


require('./d3-bundle.js');
const _ = require('lodash');
window._ = _;
require('./lodash-extensions');
