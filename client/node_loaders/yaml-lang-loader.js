var yaml = require("js-yaml");
var _ = require("lodash");

module.exports = function (src) {
  this.cacheable();

  //rootContext is constant (e.g. /Users/<name>/InfoBaseProject/),
  //resourcePath is absolute path to the currently required file
  const file_name = this.resourcePath.split(this.rootContext)[1];

  var lang = this.query.lang;

  var obj = yaml.load(src);
  _.each(obj, function (val, key) {
    if (!_.isObject(val)) {
      return [key, val];
    }
    if (lang === "en") {
      delete val.fr;
    } else {
      delete val.en;
    }
  });

  obj.__file_name__ = file_name;
  //var filtered_dump =  yaml.dump(obj);
  var filtered_dump = JSON.stringify(obj);

  return filtered_dump;
};
