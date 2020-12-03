/* eslint-disable import/order */

import React from "react";
import ReactDOM from "react-dom";
window.React = React;
window.ReactDOM = ReactDOM;

import _ from "lodash";
window._ = _;
import "./lodash-extensions.side-effects.js";

import Handlebars from "handlebars/dist/cjs/handlebars.js";
window.Handlebars = Handlebars;

import * as ib_colors from "../core/color_defs.js";
window.infobase_color_constants = ib_colors;

window._DEV_HELPERS = {};
