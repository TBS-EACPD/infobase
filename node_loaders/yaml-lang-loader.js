var yaml = require('js-yaml');
var _ = require("lodash");

module.exports = function(src){
  this.cacheable();

  var lang = this.query.lang;

  var obj = yaml.load(src);
 _.each(obj, function(val,key){
    if( !_.isObject(val) ){ return [key,val]; }
    if (lang === "en" ){
      delete val.fr;
    } else {
      delete val.en;
    }

  });


  //var filtered_dump =  yaml.dump(obj);
  var filtered_dump =  JSON.stringify(obj);
  
  return filtered_dump;
};
