import { makeExecutableSchema } from "graphql-tools";
import _ from "lodash";

import core_subject from "./core_subject/index.js";
import covid from "./covid/index.js";
import resources from "./finances/index.js";
import model_singleton from "./model_singleton.js";
import results from "./results/index.js";
import root_schema from "./schema_root.js";
import services from "./services/index.js";

// unused models, mostly still using the pre-mongoDB approach
// import sobjs from './standard_objects/index.js';
// import people from './people/index.js';
// import search from './search/index.js';
// import vote_stat from './vote_stat/index.js';
// import transfer_payments from './transfer_payments/index.js';
// import transfer_payments_loc from './transfer_payments_loc/index.js';

//the order of sub_module_defs controls the order of model creation and database population, which potentially matters
const sub_module_defs = _.compact([
  core_subject,
  results,
  resources,
  covid,
  process.env.USE_TEST_DATA && services,
  // pses,
  // sobjs,
  // search,
  // people,
  // vote_stat,
  // transfer_payments,
  // transfer_payments_loc,
]);

export function create_models() {
  _.each(
    sub_module_defs,
    ({ define_models }) =>
      _.isFunction(define_models) && define_models(model_singleton)
  );
}

export async function populate_all_models() {
  return Promise.all(
    _.map(
      sub_module_defs,
      async (_module) =>
        _.isFunction(_module.populate_models) &&
        (await _module.populate_models(model_singleton))
    )
  );
}

export function get_schema_deps() {
  const schema_strings = [root_schema.schema];
  const resolver_objs = [root_schema.resolvers];

  _.each(sub_module_defs, ({ define_schema }) => {
    if (_.isFunction(define_schema)) {
      const { schema, resolvers } = define_schema(model_singleton);

      schema_strings.push(schema);
      resolver_objs.push(resolvers);
    }
  });

  return {
    typeDefs: schema_strings,
    resolvers: _.merge(...resolver_objs),
  };
}

export function create_schema() {
  return makeExecutableSchema(get_schema_deps());
}
