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


import React from 'react';
import ReactDOM from 'react-dom';
window.React = React;
window.ReactDOM = ReactDOM;

import _ from 'lodash';
window._ = _;
import './lodash-extensions';

import d3 from './d3-bundle.js';
window.d3 = d3;

import Handlebars from 'handlebars/dist/cjs/handlebars.js';
window.Handlebars = Handlebars;


import * as feature_detection from '../core/feature_detection.js';
window.feature_detection = feature_detection;

import * as ib_colors from '../core/color_defs.js';
window.infobase_color_constants = ib_colors;

import { newIBCategoryColors } from '../core/color_schemes.js';
window.infobase_colors = (options) => d3.scaleOrdinal().range(newIBCategoryColors);

window._DEV_HELPERS = {};