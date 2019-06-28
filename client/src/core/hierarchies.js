import { Subject } from '../models/subject.js';
import { Table } from './TableClass.js';


const absolute_value_sort = (a,b) => - ( Math.abs(a.value) - Math.abs(b.value) );

const last_year_spending = (node) => {
  const programSpending = Table.lookup('programSpending');
  if ( !programSpending.programs.has(node) ){  
    return false;
  }
  return _.first(programSpending.programs.get(node))["{{pa_last_year}}exp"];
};

const last_year_fte = (node) => {
  const programFtes = Table.lookup('programFtes');
  if ( !programFtes.programs.has(node) ){  
    return false;
  }
  return _.first(programFtes.programs.get(node))["{{pa_last_year}}"];
};

const set_default_values = (node, data_type) => {
  if (node.data.is("program")){
    node.exp = last_year_spending(node.data);
    node.fte = last_year_fte(node.data);
    node.value = node[data_type];
  } else if (_.isUndefined(node.children)){
    node.value = false;
  } else {
    node.children = _.filter(node.children,d => d.value !== false && d.value !== 0);
    node.exp = d3.sum(node.children, d => d.exp);
    node.fte = d3.sum(node.children, d => d.fte);
    node.value = d3.sum(node.children, d => d.value);
  }

  node.data.search_string = "";
  if (node.data.name){
    node.data.search_string += _.deburr(node.data.name.toLowerCase());
  }
  if (node.data.description){
    node.data.search_string += _.deburr(node.data.description.replace(/<(?:.|\n)*?>/gm, '').toLowerCase());
  }

};


const get_org_hierarchy = (options) => {
  const defaults = {
    root: Subject.gov,
    data_type: "exp",
    skip_crsos: true,
    post_traversal_function: set_default_values,
  };
  const {
    root, data_type, skip_crsos, post_traversal_function,
  } = {...defaults, ...options};
  return d3.hierarchy(root,
    node => {
      if (node.is("gov")){
        return Subject.Ministry.get_all();
      } else if ( node.is("ministry") ){
        return node.orgs;
      } else if ( node.is("dept") ){
        if (skip_crsos) {
          return _.reduce(node.crsos, (memo, crso) => memo.concat(crso.programs), []);
        } else {
          return node.crsos;
        }
      } else if ( !skip_crsos && node.is("crso") ){
        return node.programs;
      } 
    })
    .eachAfter(node => {
      post_traversal_function(node, data_type);
    })
    .sort(absolute_value_sort);
};

export { 
  get_org_hierarchy,
  set_default_values,
};