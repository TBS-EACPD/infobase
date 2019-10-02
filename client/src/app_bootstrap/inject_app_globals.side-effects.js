/* eslint-disable no-undef */
if(typeof APPLICATION_LANGUAGE !== "undefined"){
  window.lang = APPLICATION_LANGUAGE;
}
if(typeof IS_A11Y_MODE !== "undefined"){
  window.is_a11y_mode = IS_A11Y_MODE;
}
if(typeof SHA !== "undefined"){
  window.long_sha = SHA;
  window.sha = SHA.substr(0,7);
}
if(typeof PREVIOUS_DEPLOY_SHA !== "undefined"){
  window.previous_sha = PREVIOUS_DEPLOY_SHA.substr(0,7);
}
if(typeof BUILD_DATE !== "undefined"){
  window.build_date = BUILD_DATE;
}
if(typeof PRE_PUBLIC_ACCOUNTS !== "undefined"){
  window.pre_public_accounts = PRE_PUBLIC_ACCOUNTS;
}
if(typeof CDN_URL !== "undefined"){
  window.cdn_url = CDN_URL;
}
if(typeof IS_DEV_LINK !== "undefined"){
  window.is_dev_link = IS_DEV_LINK;
}
if(typeof IS_DEV !== "undefined"){
  window.is_dev = IS_DEV;
}
if(window.is_dev && typeof LOCAL_IP !== "undefined"){
  window.local_ip = LOCAL_IP;
}
if(typeof IS_CI !== "undefined"){
  window.is_ci = IS_CI;
}
/* eslint-enable no-undef */


window.React = require('react');
window.ReactDOM = require('react-dom');
window.ReactDOM = ReactDOM;

window._ = require('lodash');
require('./lodash-extensions.side-effects.js');

window.d3 = require('./d3-bundle.js').default;
window.Handlebars = require('handlebars/dist/cjs/handlebars.js');


window.feature_detection = require('../core/feature_detection.js')

window.infobase_color_constants = require('../core/color_defs.js');

const { newIBCategoryColors } = require('../core/color_schemes.js');
window.infobase_colors = (options) => d3.scaleOrdinal().range(newIBCategoryColors);

window._DEV_HELPERS = {};