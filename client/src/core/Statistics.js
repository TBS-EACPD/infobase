import { mix, staticStoreMixin } from '../models/storeMixins.js';
import { Table } from './TableClass.js';
import { years } from '../models/years.js';
import { Subject } from '../models/subject.js';
import { run_template } from '../models/text.js'; //just needed for a few constants, consider moving this elsewhere...

const { Gov } = Subject;

const some_constants = {
  lang: window.lang,
  last_years: _.map(years.std_years, e => run_template(e)),
  people_years: _.map(years.people_years, e => run_template(e)),
  planning_years: _.map(years.planning_years, e => run_template(e)),
  est_next_year: run_template("{{est_next_year}}"),
  est_in_year: run_template("{{est_in_year}}"),
};

// TODO   readd memoize once debugged 
const get_single_info = _.memoize( 
  (stats_key,subject) => {
    /* eslint-disable-next-line no-use-before-define */
    const stats = Statistics.lookup(stats_key);
    if (_.isUndefined(stats)){ 
      return undefined; 
    }
    let report_subject;
    if ( stats.level === 'gov') {
      report_subject = Gov;
    } else if ((subject.is('program') || subject.is('crso')) && stats.level === 'dept' ){
      report_subject = subject.dept;
    } else {
      report_subject = subject;
    }
    return stats.report_on(report_subject);
  }, 
  (stats_key, subject) => `${stats_key}_${subject.guid}`
);

//this is the part of the module that gets consumed by those who want info, ie. core/graphs.js
function get_info(subject, infokeys){
  const computed_separate = _.map( infokeys, key => get_single_info(key, subject));
  const computed = Object.assign.apply(null,[{}].concat(computed_separate));
  return {
    subject, dept: subject.constructor.type_name === 'dept' ? subject : undefined,
    ...computed,
    ...some_constants,
  };
}

//  //gov infos should only run once, no matter the subject
//  (stats_key, subject) => {
//    return Statistics.lookup(stats_key).level === 'gov' ? stats_key : stats_key+subject.id  ;
//  }
//);

class Statistics extends mix().with(staticStoreMixin){
  constructor(def){
    super();
    Object.assign(this,def);
  }
  static create_and_register(def){
    const instance = new Statistics(def);
    this.register(def.id, instance);
  }
  report_on(subject){
    //here's the logic for handling dependencies:
    //in incremental data-loading, this will have to be promisified
    //good idea to have the info objects loaded async and have the computation synchronous
    //this might mean the info objects having to keep a ref to a loaded table... 

    const stats = {};

    const tables = (
      _.chain(this.table_deps)
        .map( id => [id,Table.lookup(id)] )
        .fromPairs()
        .value()
    );
    const infos = (
      _.chain(this.info_deps)
        .map( info_id => {
          const info_obj = this.constructor.lookup(info_id);
          let computations;
          if(info_obj.level === 'gov'){ 

            computations = get_single_info(info_id,Gov); 

          } else if( info_obj.level === this.level) { 

            computations = get_single_info(info_id,subject);

          //the requested info is about the program's parent department
          } else if( this.level === 'program' && info_obj.level === 'dept'){ 

            const parentDept = subject.dept;
            computations = get_single_info(info_id,parentDept);

          } else { 
            throw `info-object for level: ${this.level} cannot request info at ${info_obj.level} level`; 
          }

          return [info_id, computations];

        })
        .fromPairs()
        .value()
    );
    if(this.level === 'dept' && _.some(tables, t=> !t.depts[subject.id] ) ){
      stats.missing_values = true; 
    }
    if( _.some(infos, info => info.missing_values ) ){ 
      stats.missing_values = true; 
    }

    const prefix = this.level+'_';
    //add has two API, add({ key: ... , val: ... }) or add('key', val)
    const add = (obj,num) => {  
      const key = (prefix + (obj.key || obj) ).replace(/(\{|\})/g,""); //turn stuff like {{last_year}} into last_year
      const val = obj.value || num;
      stats[key] = val;
    };
    try {
      this.compute.call(null, subject, tables, infos, add, stats);
    } catch (e){ 
      if(window.is_dev){
        /* eslint-disable no-console */
        console.error(`missing values for ${subject.name}`);
      }
      stats.missing_values = true;
    }
       
    return stats;
  }
}

function tables_for_statistics( stat_key ){
  const stat_obj = Statistics.lookup(stat_key);
  return _.chain( stat_obj.info_deps)
    .map( tables_for_statistics )
    .flatten()
    .union( stat_obj.table_deps )
    .uniqBy()
    .value();
}

window._DEV_HELPERS.Statistics = Statistics;

export { 
  Statistics, 
  get_info,
  tables_for_statistics,
};
