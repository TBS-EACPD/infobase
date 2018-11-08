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
if(typeof PRE_PUBLIC_ACCOUNTS !== "undefined"){
  window.pre_public_accounts = PRE_PUBLIC_ACCOUNTS;
}
if(typeof CDN_URL !== "undefined"){
  window.cdn_url = CDN_URL;
}
if(typeof IS_DEV_LINK !== "undefined"){
  window.is_dev_link = IS_DEV_LINK;
}
if(typeof DEV !== "undefined"){
  window.is_dev_build = DEV;
}
/* eslint-enable no-undef */


import * as feature_detection from '../core/feature-detection.js';
window.feature_detection = feature_detection;

//3rd party libraries injected into global scope
//note that these next few lines must be run before anything using lodash, handlebars, etc.
import accounting from 'accounting';
import marked from 'marked';
import React from 'react';
import ReactDOM from 'react-dom';

window.accounting = accounting;
window.marked = marked;
window.React = React;
window.ReactDOM = ReactDOM;

import _ from 'lodash';
window._ = _;
import './lodash-extensions';

import d3 from './d3-bundle.js';
window.d3 = d3;

import { Spinner } from '../core/Spinner.js';
window.Spinner = Spinner;

import { infobaseCategory10Colors } from '../core/color_schemes.js';
window.infobase_colors = () => d3.scaleOrdinal().range(infobaseCategory10Colors);

import Handlebars from 'handlebars/dist/cjs/handlebars.js';
window.Handlebars = Handlebars;