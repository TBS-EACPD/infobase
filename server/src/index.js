// this file is the entry-point for GCF, it won't be used in dev
const _ = require('lodash');
global._ = _;
const app = require('./app');
global.IS_DEV_SERVER = false;
module.exports = { app }