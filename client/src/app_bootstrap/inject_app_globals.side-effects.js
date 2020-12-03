/* eslint-disable import/order */

import React from "react";
import ReactDOM from "react-dom";
window.React = React;
window.ReactDOM = ReactDOM;

import _ from "lodash";
window._ = _;
import "./lodash-extensions.side-effects.js";

import d3 from "./d3-bundle.js";
window.d3 = d3;

import Handlebars from "handlebars/dist/cjs/handlebars.js";
window.Handlebars = Handlebars;

import * as ib_colors from "../core/color_defs.js";
window.infobase_color_constants = ib_colors;

import { newIBCategoryColors } from "../core/color_schemes.js";
window.infobase_colors = (options) =>
  d3.scaleOrdinal().range(newIBCategoryColors);

window._DEV_HELPERS = {};
