import { Pack } from '../core/charts_index.js';
import { Table } from '../core/TableClass.js';
import { text_maker } from './text_provider.js';
import { formats } from '../core/format.js';
import { Subject } from '../models/subject.js';


//these functions assume orgVoteStatPa and programFtes are already loaded.

const { Dept } = Subject;

function nest_data_for_exploring(to_be_nested, top_name, level_assigner){
  var data = Pack.pack_data(to_be_nested,text_maker("smaller_orgs"),{
    soften: false,
    level_assigner,
    per_group: grp => {
      grp._value = d3.sum(grp.children,_.property('__value__'));
    },
  });

  data.name = top_name;
  return data;
};


export function by_min_dept(){
  // this function regroups departments into their respective ministries
  // 1 - all departments in orgVoteStatEstimates are obtained
  // 2 - the depratments are mapped into an object with three keys
  //      min, name, value=total_net_auth, _value
  //      becuase value will be changed during the softening, _value is held
  //      for the tooltip
  // 3 - departments with a 0 value are filtered out
  // 4 - departments are grouped by ministry
  // 5 - the ministry groups are mapped into new objects with three keys
  //      name, children=depts and value=sum of total net auth
  //      in addition, the relative value of each department's total not auth
  //      is softened for display purposes'
  var table = Table.lookup('orgVoteStatPa');

  // group the departments by
  // minisries and then do a reduce sum to extract the fin size
  // of each ministry

  var min_objs = _.chain(table.depts)
    .keys()
    .map(dept_code => ({ 
      dept: Dept.lookup(dept_code),
      last_year: table.q(dept_code).sum("{{pa_last_year}}exp"),
    }))
    .filter( ({last_year}) => _.isNumber(last_year) && last_year !== 0)
    .filter(({dept}) => !_.isUndefined(dept.status) && !_.isUndefined(dept.ministry) )
    .map( ({ dept, last_year}) => ({
      subj_obj: dept,
      min: dept.ministry.name,
      unique_id: dept.unique_id,
      name: dept.fancy_name,
      __value__: last_year,
      value: Math.abs(last_year),
    }))
    .filter(d => d.value !== 0)
    .groupBy(_.property('min'))
    .map((depts, min_name) => {
      Pack.soften_spread(depts);
      return {
        name: min_name,
        children: depts,
        value: d3.sum(depts, _.property('value')),
        __value__: d3.sum(depts, _.property('__value__')),
      };
    })
    .value();

  const rangeRound = [1,2,3,5];
  const vals = _.map(min_objs, 'value');
  const [min,max] = d3.extent(vals);
  const scale = d3.scaleLog()
    .domain([min, d3.quantile(vals,0.2), d3.quantile(vals,0.9), max])
    .rangeRound(rangeRound);
  const level_assigner = val => {
    const scale_val = scale(val);
    //the last range val is much bigger on purpose, round all big vals to the largest
    if(rangeRound.length > 2 && scale_val > rangeRound[rangeRound.length - 2]){
      return _.last(rangeRound);
    }
    return scale_val;
  }
  var data = nest_data_for_exploring(min_objs,text_maker("goc_total"),level_assigner);
  _.each(min_objs, d => { delete d.value; });
  return {
    data,
    keys: _.keys(table.depts),
  };
};

export function by_dept_type(){
  var table = Table.lookup('orgVoteStatPa');
  // group the departments by
  // minisries and then do a reduce sum to extract the fin size
  // of each ministry
  var type_objs = _.chain(table.depts)
    .keys()
    .map(function(key){
      const dept = Dept.lookup(key);
      const total = table.q(key).sum("{{pa_last_year}}exp");
      return {
        subj_obj: dept,
        type: dept.type,
        unique_id: dept.unique_id,
        name: dept.fancy_name,
        __value__: total,
        value: Math.abs(total),
      };
    })
    .filter(d => d.value !== 0)
    .groupBy(_.property('type'))
    .tap( dept_groups => _.each(dept_groups, depts => Pack.soften_spread(depts) ) )
    .map( (depts, type) => ({
      name: type,
      children: depts,
      value: d3.sum(depts, _.property('value')),
      __value__: d3.sum(depts, _.property('__value__')),
    }))
    .value();


  


  const trivial_level_assigner = _.constant(1);
  var data = nest_data_for_exploring(type_objs,text_maker("goc_total"), trivial_level_assigner );

  _.each(data.children, node => {
    const { children } = node;
    const rangeRound = [1,2,3];
    const vals = _.map(children, 'value');
    let level_assigner = _.constant(1);
    if(children.length > 10){
      const min = d3.extent(vals)[0];
      const scale = d3.scaleLog()
        .domain([min, d3.quantile(vals, 0.8)])
        .rangeRound(rangeRound);
      
      level_assigner = val => {
        const scale_val = scale(val);
        //the last range val is much bigger on purpose, round all big vals to the largest
        if(rangeRound.length > 2 && scale_val > rangeRound[rangeRound.length - 2]){
          return _.last(rangeRound);
        }
        return scale_val;
      }
    }

    node.children = nest_data_for_exploring(children, "", level_assigner).children;
  })
  return {
    data,
    keys: _.keys(table.depts),
  };
};

export function by_this_year_emp(){
  var table = Table.lookup("programFtes");
  var by_people = _.chain(table.depts)
    .keys()
    .map(key => {
      const dept = Dept.lookup(key);
      const total = table.q(key).sum("{{pa_last_year}}");
      return {
        subj_obj: dept,
        unique_id: dept.unique_id,
        name: dept.fancy_name,
        __value__: total,
        value: Math.abs(total),
      };
    })
    .filter(d => d.value !== 0)
    .value();

  const rangeRound = [1,2,3,4,8];
  const vals = _.map(by_people, 'value');
  const [min,max] = d3.extent(vals);
  const scale = d3.scaleSqrt()
    .domain([min, d3.quantile(vals, 0.15), d3.quantile(vals,0.4), d3.quantile(vals,0.95), max])
    .rangeRound(rangeRound);
  const level_assigner = val => {
    const scale_val = scale(val);
    //the last range val is much bigger on purpose, round all big vals to the largest
    if(rangeRound.length > 2 && scale_val > rangeRound[rangeRound.length - 2]){
      return _.last(rangeRound);
    }
    return scale_val;
  }


  var data = nest_data_for_exploring(by_people, text_maker("goc_total"), level_assigner );
  return {
    data, 
    keys: _.keys(table.depts), 
    format: formats["big_int_real"],
  }; 
};

