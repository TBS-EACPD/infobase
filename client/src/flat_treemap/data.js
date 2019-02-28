import { Table } from '../core/TableClass.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { create_text_maker } from '../models/text.js';
import { GranularResultCounts } from '../models/results.js'
import { Subject } from '../models/subject.js';
import { formats } from '../core/format.js';

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

export async function get_vs_top10_data(){
  await ensure_loaded({
    table_keys: ["orgVoteStatEstimates"],
    require_granular_result_counts: true
  });

  const vs = 'voted';

  const main_col = "{{est_in_year}}_estimates";
  const text = text_maker(vs);

  const orgVoteStatEstimates = Table.lookup('orgVoteStatEstimates');

  const all_rows = _.chain(orgVoteStatEstimates.voted_stat(main_col,false,false)[text])
    .sortBy(x => -x[main_col] )
    .map(d => _.pick(d,"desc",'dept',main_col) )               
    .value();

  // const ret = {};
  // ret.text_func = d => {
  //   const val = formats.compact1(d.value);
  //   let text = `${d.data.desc}: ${val}`;

  //   if (d.data.dept){

  //     text = `${Subject.Dept.lookup(d.data.dept).fancy_name} -  ${text}`;
  //   }
  //   const estimated_string_size = (d.zoom_r*1.2/5) * d.zoom_r/18; 
  //   return text_abbrev(text, estimated_string_size);
  // };
  const data = _.take(all_rows,10);
  if (vs === 'voted'){
    //vote descriptions are of the form "<vote desc> - <vote num>"
    //lets strip out the hyphen and everything that follows
    data.forEach(row => row.desc = row.desc.replace(/-.+$/,""));
  }
  data.push({
    desc: text_maker(`all_other_${vs}_items`),
    others: true,
    [main_col]: d3.sum(_.tail(all_rows,10), d => d[main_col]),
  });

  return data;
}

export async function get_data(perspective, org_id, year, filter_var) {
  await ensure_loaded({
    table_keys: ["programSpending", "programFtes"],
    require_granular_result_counts: true
  });

  let data;

  const counts = GranularResultCounts.get_data();
  const program_ftes_table = Table.lookup('programFtes');
  const program_spending_table = Table.lookup('programSpending');

  const all_progs = Program.get_all();
  const progs_by_crso = _.chain(all_progs).groupBy('crso.id').value();
  const all_crsos = CRSO.get_all();
  const crsos_by_dept = _.chain(all_crsos).groupBy('dept.id').value();


  const orgs = _.chain(Dept.get_all())
    .map(org => ({
      subject: org,
      name: org.fancy_name,
      children: _.chain(crsos_by_dept[org.id])
        .map(crso => ({
          subject: crso,
          name: crso.fancy_name,
          children: _.chain(progs_by_crso[crso.id])
            .map(prog => ({
              subject: prog,
              name: prog.fancy_name,
              amount: program_spending_table.q(prog).sum(header_col("amount",year)),
              ftes: program_ftes_table.q(prog).sum(header_col("ftes",year)) || 0, // if NA 
              prog_id: prog.id,
              drr17_total: _.chain(counts)
                .filter({ id: prog.id })
                .sumBy("drr17_total")
                .value(),
              drr17_met: _.chain(counts)
                .filter({ id: prog.id })
                .sumBy("drr17_indicators_met")
                .value(),
              drr17_notmet: _.chain(counts)
                .filter({ id: prog.id })
                .sumBy("drr17_indicators_not_met")
                .value(),
              drr17_na: _.chain(counts)
                .filter({ id: prog.id })
                .sumBy("drr17_indicators_not_available")
                .value(),
              drr17_future: _.chain(counts)
                .filter({ id: prog.id })
                .sumBy("drr17_indicators_future")
                .value(),
              all_results: _.filter(counts, { id: prog.id })[0],
            }))
            .filter(n => has_non_zero_or_non_zero_children(n, perspective))
            .value(),
        }))
        .filter(n => has_non_zero_or_non_zero_children(n, perspective))
        .value(),
    }))
    .filter(n => has_non_zero_or_non_zero_children(n, perspective))
    .value();

  data = _.chain(orgs)
    .groupBy('subject.ministry.name')
    .toPairs()
    .map(([min_name, orgs]) => (
      {
        name: min_name,
        children: orgs,
        subject: "Ministry",
      }
    ))
    .value();
  const root = {
    name: "Government",
    children: data,
    amount: _.sumBy(data, "amount"),
  };
  prep_nodes(root, perspective);
  return root;
}
