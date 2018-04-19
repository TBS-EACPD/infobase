const yaml = require("./businessConstants.yaml")

// modifies object by replacing obj with 
// its string of appropriate language 
// unless ther are other properties (transform) 
//then it will move the text to the 'text' property
const unlangify = (obj) => {
  if(!obj) {return;}
  if(obj[window.lang]){
    obj.text = obj[window.lang];
    //delete old properties
    delete obj.en;
    delete obj.fr;
  }
}

//remove nested lang properties
//there aren't enough to warrant 
//the complexity of removing them at build-time
_.each(yaml, collection => {
  _.each(collection, obj => unlangify(obj));
}
);

_.each(yaml.sos, (val,key)=>{
  val.so_num = +key;
});

//for sorting convenience, attach the index of each month
_.each(yaml.months, (obj,ix) => {
  obj.ix = ix;
});


//TODO : why are employee ages so awkward?
const compact_age_groups = (
  window.lang === 'en' ? 
  [
    'Age 29 and less',
    'Age 30 to 39',
    'Age 40 to 49',
    'Age 50 to 59',
    'Age 60 and over',
    'Not Available',
  ] :
  [
    '29 ans et moins',
    '30 à 39 ans',
    '40 à 49 ans',
    '50 à 59 ans',
    '60 ans et plus',
    'Non disponible',
  ]
);
const emp_age_map =  {
  '< 20': compact_age_groups[0], 
  '20-24': compact_age_groups[0],
  '25-29': compact_age_groups[0],
  '30-34': compact_age_groups[1], 
  '35-39': compact_age_groups[1], 
  '40-44': compact_age_groups[2],
  '45-49': compact_age_groups[2],
  '50-54': compact_age_groups[3], 
  '55-59': compact_age_groups[3],
  '60-64': compact_age_groups[4],
  '65+': compact_age_groups[4], 
  'N.A.': compact_age_groups[5],
  'N.D.': compact_age_groups[5],
};

const emp_age_rev_map = _.chain(emp_age_map)
  .toPairs()
  .groupBy(([key,val]) => val)
  .map((val, key)=> [key, _.map(val,0)])
  .fromPairs()
  .value();

const emp_age_stuff = { compact_age_groups, emp_age_map, emp_age_rev_map };

const ex_level_target = (
  window.lang === 'en' ? 
  [
    'Executive',
    'Non-Executive',
  ] :
  [
    'Cadres supérieurs',
    'Non-cadres supérieursn',
  ]
);
const compact_ex_level_map =  {
  'EX 01': ex_level_target[0], 
  'EX 02': ex_level_target[0],
  'EX 03': ex_level_target[0],
  'EX 04': ex_level_target[0], 
  'EX 05': ex_level_target[0], 
  'Non-EX': ex_level_target[1],
};

const ex_level_rev_map = _.chain(compact_ex_level_map)
  .toPairs()
  .groupBy(function(key_val){ return key_val[1];})
  .map(function(val, key){ return [key, _.map(val,0)];})
  .fromPairs()
  .value();

const ex_level_stuff = { ex_level_target, compact_ex_level_map, ex_level_rev_map };  

window._businessConstants = module.exports = exports = Object.assign({}, yaml, emp_age_stuff, ex_level_stuff)
