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

import * as feature_detection from '../core/feature-detection.js';
window.feature_detection = feature_detection;

//3rd party libraries injected into global scope
//note that these next few lines must be run before anything using lodash, handlebars, etc.
import accounting from 'accounting';
import marked from 'marked';
import React from 'react';
window.accounting = accounting;
window.marked = marked;
window.React = React;

import d3 from './d3-bundle.js';
window.d3 = d3;

import { infobaseCategory10Colors } from '../core/color_schemes.js';
window.infobase_colors = () => d3.scaleOrdinal().range(infobaseCategory10Colors);

import _ from 'lodash';
window._ = _;
import './lodash-extensions';

import Handlebars from 'handlebars/dist/cjs/handlebars.js';
window.Handlebars = Handlebars;