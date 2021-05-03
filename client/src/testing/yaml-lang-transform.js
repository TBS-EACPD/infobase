const path = require("path");

const yaml = require("js-yaml");

module.exports = {
  process(src, filename, config, options) {
    const obj = yaml.load(src);

    //to mock webpack properly, we need relative paths w/ respect to <repo>/client/
    //jest's filename arg is an absolute path
    // it's probably safer to check for "/client/src/"" than just "client"
    const rel_path_wrt_src = filename.split("/client/src/")[1];
    obj.__file_name__ = `/src/${rel_path_wrt_src}`;
    //note that unlike yaml-lang-loader, we don't wipe the other language

    return `module.exports = ${JSON.stringify(obj)};`;
  },
};
