import { readdirSync, readFileSync } from "fs";
import path from "path";

import _ from "lodash";

const get_templates = () => {
  const templates_path = path.join(__dirname, "../../templates");

  const json_template_names = _.chain(readdirSync(templates_path))
    .filter((file_name) => /\.json$/.test(file_name))
    .map((file_name) => file_name.replace(/\.json$/, ""))
    .value();

  const template_name_content_pairs = _.map(
    json_template_names,
    (json_template_name) => [
      json_template_name,
      JSON.parse(
        readFileSync(`${templates_path}/${json_template_name}.json`, "utf8")
      ),
    ]
  );

  return _.fromPairs(template_name_content_pairs);
};

export { get_templates };
