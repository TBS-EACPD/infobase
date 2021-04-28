import { graphql } from "graphql";

import { connect_db } from "./db_utils.js";
import { create_schema, create_models } from "./models/index.js";

connect_db();
create_models();
const schema = create_schema();
global.execQuery = async function (query, vars = {}) {
  if (!vars.lang) {
    vars = { lang: "en", ...vars };
  }
  const result = await graphql(schema, query, null, {}, vars);
  return result;
};
