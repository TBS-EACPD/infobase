import _ from 'lodash';
import { readdirSync, readFile } from 'fs';
import { promisify } from 'util';
import path from 'path';

const readFileAsync = promisify(readFile);

const get_templates = async () => {
  const templates_path = path.join(__dirname, '../../templates');

  const json_template_names = readdirSync(
    templates_path,
    (files) => _.chain(files)
      .filter( (file_name) => /\.json$/.test(file_name) )
      .reduce( (file_name) => file_name.replace(/\.json$/, '') )
      .value()
  );
  const template_name_content_pairs = await Promise.all(
    _.map(
      json_template_names,
      (json_template_name) => readFileAsync(`${templates_path}/${json_template_name}`, "utf8")
        .then( (json) => {
          return [
            json_template_name,
            JSON.parse(json),
          ];
        })
    )
  );

  return _.fromPairs(template_name_content_pairs);
};

export { get_templates };