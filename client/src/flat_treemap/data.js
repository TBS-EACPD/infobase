import { Table } from '../core/TableClass.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { create_text_maker } from '../models/text.js';
import { GranularResultCounts } from '../models/results.js'
import { Subject } from '../models/subject.js';
import { formats } from '../core/format.js';
import { text_abbrev } from '../general_utils.js';

const { Dept } = Subject;
const { Program } = Subject;
const { CRSO } = Subject;
const text_maker = create_text_maker();


function header_col(perspective, year) {
  if (!year) { return -1 }; // error, but this should never happen
  if (perspective === "amount") {
    switch (year) {
      case "pa_last_year_5": return "{{pa_last_year_5}}exp";
      case "pa_last_year_4": return "{{pa_last_year_4}}exp";
      case "pa_last_year_3": return "{{pa_last_year_3}}exp";
      case "pa_last_year_2": return "{{pa_last_year_2}}exp";
      case "pa_last_year": return "{{pa_last_year}}exp";
      case "planning_year_1": return "{{planning_year_1}}";
      case "planning_year_2": return "{{planning_year_2}}";
      case "planning_year_3": return "{{planning_year_3}}";
    }
  } else if (perspective === "ftes") {
    switch (year) {
      case "pa_last_year_5": return "{{pa_last_year_5}}";
      case "pa_last_year_4": return "{{pa_last_year_4}}";
      case "pa_last_year_3": return "{{pa_last_year_3}}";
      case "pa_last_year_2": return "{{pa_last_year_2}}";
      case "pa_last_year": return "{{pa_last_year}}";
      case "planning_year_1": return "{{planning_year_1}}";
      case "planning_year_2": return "{{planning_year_2}}";
      case "planning_year_3": return "{{planning_year_3}}";
    }
  } else {
    return -1;
  }
}

// TODO: ???
function has_non_zero_or_non_zero_children(node) {
  if (_.isEmpty(node.children)) {
    return Math.abs(node.amount) > 0;
  } else {
    return _.some(node.children, has_non_zero_or_non_zero_children);
  }
}

function prep_nodes(node, perspective, ministry_name) {
  const { children } = node;
  if (node.subject === "Ministry") {
    node.ministry_name = node.name;
    node.is_ministry = true;
  } else {
    node.ministry_name = ministry_name;
    node.is_ministry = false;
  }
  if (!_.isEmpty(children)) {
    _.each(children, child => { prep_nodes(child, perspective, node.ministry_name) });
    if (!node.amount) {
      node.amount = _.sumBy(children, "amount");
      node.size = _.sumBy(children, "size");
      node.ftes = _.sumBy(children, "ftes");
    }
    _.each(children, n => {
      _.set(n, "parent_amount", node.amount);
      _.set(n, "parent_name", node.name);
      _.set(n, "parent_ftes", node.ftes);
    });
  } else {
    //leaf node, already has amount but no size
    node.size = Math.abs(node.amount);
  }
  if (node.amount < 0) {
    node.is_negative = true;
  }
}

export async function get_vs_top10_data(vs) {
  await ensure_loaded({
    table_keys: ["orgVoteStatEstimates"],
  });

  const main_col = "{{est_in_year}}_estimates";
  const vs_text = text_maker(vs);

  const orgVoteStatEstimates = Table.lookup('orgVoteStatEstimates');

  const all_rows = _.chain(orgVoteStatEstimates.voted_stat(main_col, false, false)[vs_text])
    .sortBy(x => -x[main_col])
    .map(d => _.pick(d, "desc", 'dept', main_col))
    .value();

  const text_func = d => {
    if(vs=='voted'){
      return d.dept ? `${Subject.Dept.lookup(d.dept).fancy_name} -  ${d.desc}` : d.desc;
    } else {
      return d.dept ? `${d.desc} (${Subject.Dept.lookup(d.dept).fancy_name})` : d.desc;
    }
  }
  const data = _.take(all_rows, 10);
  data.forEach(row => {
    if(vs === 'voted'){
      //vote descriptions are of the form "<vote desc> - <vote num>"
      //lets strip out the hyphen and everything that follows
      row.desc = row.desc.replace(/-.+$/, "");
    }
    row.value = row["{{est_in_year}}_estimates"];
    row.name = text_func(row);
  });
  
  data.push({
    name: text_maker(`all_other_${vs}_items`),
    others: true,
    value: d3.sum(_.tail(all_rows, 10), d => d[main_col]),
  });

  const root = {
    name: "Government",
    children: data,
  };
  return root;
}
