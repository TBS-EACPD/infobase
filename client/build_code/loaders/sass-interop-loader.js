// Adds ephemeral :export { ... } block to .interop.sass modules during webpack processing.
// Necessary for css-loader to add exports to generated JS modules, but not worth the headache
// of managing as hardcoded statements inside .interop.sass modules

const path = require("path");

const _ = require("lodash");

const loader_name = path.basename(__filename); // eslint-disable-line no-undef

// as documented in /client/docs/style-sheets/interop-sass-modules.md, this intentionally only matches on and exports "top level" variables,
// intenionally ignoring any sass "global" (module level) variables from inside of sass branching syntax blocks (e.g. SASS ifs, loops, etc)
const sass_variable_pattern = /^\$(.*?):.*/;

const get_top_level_variable_names = (content) =>
  _.chain(content)
    .split("\n")
    .filter((line) => sass_variable_pattern.test(line))
    .map((export_line) => export_line.replace(sass_variable_pattern, "$1"))
    .value();

const test_variable_type_cases = (scss_module_path, variable_names) => {
  const non_camel_case_names = _.filter(
    variable_names,
    (name) => _.camelCase(name) !== name
  );

  if (!_.isEmpty(non_camel_case_names)) {
    throw new Error(
      `${scss_module_path}: for consistency and to ensure interopability between .interop.scss modules and JS, top level SCSS variables (and preferably all SCSS variables) must be in camelCase. Check the following: ${_.join(
        non_camel_case_names,
        "\n  "
      )}`
    );
  }
};

const get_generated_export_block = (variable_names) =>
  _.chain(variable_names)
    .map((name) => `  ${name}: $${name};`)
    .join("\n")
    .thru(
      (exports) =>
        `// variable exports added by ${loader_name}\n:export {\n${exports}\n}`
    )
    .value();

module.exports = function (content) {
  const top_level_variable_names = get_top_level_variable_names(content);

  if (!_.isEmpty(top_level_variable_names)) {
    test_variable_type_cases(this.resourcePath, top_level_variable_names);

    return `${content}\n${get_generated_export_block(
      top_level_variable_names
    )}`;
  } else {
    return content;
  }
};
