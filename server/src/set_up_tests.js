const { graphql } = require("graphql");

const { connect_db } = require("./db_utils.js");
const { create_schema, create_models } = require('./models/index.js');

global.USE_TEST_DATA = true;
global.IS_DEV_SERVER = true;

connect_db();
create_models();
const schema = create_schema();
global.execQuery = async function(query, vars={}){
  if(!vars.lang){
    vars = { lang: "en", ...vars };
  }
  const result = await graphql(schema, query, null, {} ,vars);
  return result;
};