import { makeExecutableSchema } from "graphql-tools";
import _ from "lodash";

import core_subject from "./core_subject";
import covid from "./covid";
import resources from "./finances";
import model_singleton from "./model_singleton.js";
import results from "./results";
import root_schema from "./schema_root.js";

//each sub-module is included here
import services from "./services";
// import sobjs from './standard_objects';
// import people from './people';
// import search from './search';
// import vote_stat from './vote_stat';
// import transfer_payments from './transfer_payments';
// import transfer_payments_loc from './transfer_payments_loc';

//the order of sub_module_defs controls the order of model creation and database population, which potentially matters
const sub_module_defs = _.compact([
  core_subject,
  results,
  resources,
  covid,
  !process.env.USE_REMOTE_DB && services, // Dev only ATM
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
