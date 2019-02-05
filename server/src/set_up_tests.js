const { graphql } = require("graphql");


const {
  create_models,
  populate_models,
  create_schema,
} = require('./models/index.js');


create_models();
populate_models();
const schema = create_schema();

global.execQuery = async function(query, vars={}){
  if(!vars.lang){
    vars = { lang: "en", ...vars };
  }
  const result = await graphql(schema, query, null, {} ,vars);
  return result;
};
  