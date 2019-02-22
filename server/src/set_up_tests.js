const { graphql } = require("graphql");


const {
  create_models,
  populate_models,
  create_schema,
} = require('./models/index.js');

const { connect_db } = require("./db.js");

global.USE_TEST_DATA = true;
global.IS_DEV_SERVER = true;

create_models();
connect_db();
// populate_models();
const schema = create_schema();


global.execQuery = async function(query, vars={}){
  if(!vars.lang){
    vars = { lang: "en", ...vars };
  }
  const result = await graphql(schema, query, null, {} ,vars);
  return result;
};