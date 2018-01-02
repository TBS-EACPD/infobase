var yaml = require('js-yaml');
var _ = require("underscore");

module.exports = function(src){
  this.cacheable();

  var lang = this.query.lang;

  var obj = yaml.load(src);
 _.chain(obj)
  .map(function(val,key){
    if( !_.isObject(val) ){ return [key,val]; }
    if (lang === "en" ){
      delete val.fr;
    } else {
      delete val.en;
    }
    return [key,val];
  })
  .object();
  //var filtered_dump =  yaml.dump(obj);
  var filtered_dump =  JSON.stringify(obj);
  
  return filtered_dump;
};
