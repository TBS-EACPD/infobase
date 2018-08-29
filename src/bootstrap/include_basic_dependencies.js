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
if(typeof CDN_URL !== "undefined"){
  window.CDN_URL = CDN_URL;
}



import 'whatwg-fetch';
import '../common_css/site.scss';
import '../common_css/wet-holdovers.scss';
import '../common_css/boostrap-fixes-extensions.scss';
import '../common_css/grid-system.scss';
import '../common_css/flexbox-grid.css';
import '../common_css/tables.scss';


//3rd party libraries injected into global scope
//note that these next few lines must be run before anything using lodash, handlebars, etc.
import accounting from 'accounting';
import marked from 'marked';
import Handlebars from 'handlebars/dist/cjs/handlebars.js';
import React from 'react';

window.accounting = accounting;
window.marked = marked;
window.Handlebars = Handlebars;
window.React = React;

import './d3-bundle.js';
import _ from 'lodash';
window._ = _;
import './lodash-extensions';
