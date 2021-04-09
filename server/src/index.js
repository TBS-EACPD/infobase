// this file is the entry-point for GCF, it won't be used in dev
const _ = require("lodash");

global._ = _;
const { app, start_apollo } = require("./app");
start_apollo();
module.exports = { app };
