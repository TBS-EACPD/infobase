import { text_maker, TM } from './text-provider';
import { createSelector } from 'reselect';
import { Format } from '../util_components.js';
import { Table } from '../core/TableClass.js';
import FootNote from '../models/footnotes.js';
import {GlossaryEntry} from '../models/glossary.js';
import { Subject } from '../models/subject.js';
import { convert_d3_hierarchy_to_explorer_hierarchy } from '../gen_expl/hierarchy_tools.js';
import { shallowEqualObjectsOverKeys } from '../general_utils.js';

const { Dept } = Subject;

const biv_footnote = text_maker("biv_footnote");
const this_year_col = "{{est_in_year}}_estimates";
const last_year_col = "{{est_last_year}}_estimates";
const row_identifier_func = row => `${row.dept}-${row.votenum}-${row.desc}`; 


export const current_doc_is_mains = true; // Update this when switching between displaying mains and sups!
export const current_sups_letter = ""; // Update this on each new sups release!

const current_doc_code = current_doc_is_mains ? "MAINS" : `SE${current_sups_letter}`;
const ordered_est_docs = ["MAINS", "VA", "SA", "SEA", "SEB", "SEC"];

const prior_in_year_doc_filter = (item) => _.chain(ordered_est_docs)
  .takeWhile( est_doc => est_doc !== current_doc_code)
  .includes( item.est_doc_code )
  .value();
const get_comparision_value = (group) => current_doc_is_mains ?
  _.chain(group).filter(item => item.est_doc_code === "MAINS").sumBy(last_year_col).value() :
  _.chain(group).filter(prior_in_year_doc_filter).sumBy(this_year_col).value();

const reduce_by_current_doc_dim = (rows) => _.chain(rows)
  .groupBy(row_identifier_func)
  .toPairs()
  .map( ([_x, group]) => {
    const [ first ] = group;
    return {
      dept: first.dept,
      desc: first.desc,
      votenum: first.votenum,
      current_value: _.chain(group).filter({est_doc_code: current_doc_code}).sumBy(this_year_col).value(),
      comparison_value: get_comparision_value(group),
      _rows: group,
    };
  })
  .value();

const get_doc_code_breakdowns = rows => _.chain(rows)
  .filter(row => row.est_doc_code === "MAINS" || row[last_year_col] || row[this_year_col]) //always include mains, even if it's zero
  .groupBy('est_doc_code')
  .toPairs()
  .map( ([doc_code,group]) => ({
    doc_code,
    amount_last_year: _.some(group, last_year_col) && _.sumBy(group, last_year_col),
    amount_this_year: _.some(group, this_year_col) && _.sumBy(group, this_year_col),
  }))
  .value();

const key_for_table_row = row => `${row.dept}-${row.votenum}-${row.desc}`;

const get_keys_in_sups = (include_stat) => _.chain(Table.lookup('orgVoteStatEstimates').data)
  .pipe( include_stat ? _.identity : rows => _.reject(rows, {votestattype: 999}) )
  .filter( row => row[this_year_col] && row.est_doc_code === current_doc_code )
  .map( row => [key_for_table_row(row), 1] )
  .fromPairs()
  .value();

const calculate_percent_value = (current_value, comparison_value) => (
  current_doc_is_mains ?
    (current_value - comparison_value)/comparison_value :
    current_value/comparison_value
) || 0;

function get_data_by_org(include_stat){

  const keys_in_sups = get_keys_in_sups(include_stat);

  const data = _.chain(Table.lookup('orgVoteStatEstimates').data)
    .pipe( include_stat ? _.identity : rows => _.reject(rows, {votestattype: 999}) )
    .pipe( reduce_by_current_doc_dim )
    .groupBy('dept')
    .toPairs()
    .map( ([org_id, rows]) => {

      const org = Dept.lookup(org_id);

      let current_value = 0;
      if (current_doc_is_mains){
        current_value = _.sumBy(rows, "current_value") || 0;
        if (current_value === 0){
          return null;
        }
      } else {
        const sups_rows = _.filter(rows, row => keys_in_sups[key_for_table_row(row)]);
        if ( _.isEmpty(sups_rows) || !_.some(sups_rows, row => row.current_value || row.comparison_value) ){
          return null;
        }
        current_value = _.sumBy(sups_rows, "current_value") || 0;
      }

      const comparison_value = _.sumBy(rows, "comparison_value") || 0;

      const amounts_by_doc = get_doc_code_breakdowns( _.flatMap(rows, "_rows") );

      return {
        id: org_id,
        data: {
          name: org.name,
          subject: org,
          current_value,
          comparison_value,
          percent_value: calculate_percent_value(current_value, comparison_value),
          footnotes: FootNote.get_for_subject(
            org,
            [
              "AUTH",
              "EST_PROC",
              "VOTED",
              "STAT",
            ]
          ),
          amounts_by_doc,
        },
        children: _.chain(rows)
          .map(row => {
            const current_value = row["current_value"] || 0;
            const comparison_value = row["comparison_value"] || 0;
  
            if ( !current_value && !comparison_value ){
              return null;
            }

            return {
              id: `${org_id}-${row.desc}`,
              data: {
                name: row.desc,
                current_value,
                comparison_value,
                percent_value: calculate_percent_value(current_value, comparison_value),
                footnotes: get_footnotes_for_votestat_item({
                  desc: row.desc, 
                  org_id, 
                  votenum: row.votenum,
                }),
                amounts_by_doc: get_doc_code_breakdowns(row._rows),
              },
            };
          })
          .compact()
          .value(),
      };
    })
    .compact()
    .value();

  const root = {
    id: "root",
    data: {},
    children: data,
  };

  const d3_h7y = d3.hierarchy( root, _.property('children') );
  return convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);

}


const strip_stat_marker = str => str.indexOf("(S) ") > -1 ? str.split("(S) ")[1] : str;
const get_category_children = (rows) => _.chain(rows)
  .pipe(reduce_by_current_doc_dim)
  .map(new_row => {
    const { votenum, desc, dept } = new_row;
    const current_value = new_row.current_value || 0;
    const comparison_value = new_row.comparison_value || 0;

    if( !current_value && !comparison_value ){
      return null;
    }

    return {
      id: `${dept}-${votenum}-${desc}`,
      data: {
        name: `${Dept.lookup(dept).name} - ${strip_stat_marker(desc)}`,
        comparison_value,
        current_value,
        percent_value: calculate_percent_value(current_value, comparison_value),
        amounts_by_doc: get_doc_code_breakdowns(new_row._rows),
        footnotes: get_footnotes_for_votestat_item({
          desc,
          org_id: dept,
          votenum,
        }),
      },
    };
  })
  .compact()
  .value();


function get_data_by_item_types(){
  const keys_in_sups = get_keys_in_sups(true);
  
  const nested_data = _.chain( Table.lookup('orgVoteStatEstimates').major_voted_big_stat([this_year_col,last_year_col], false, false) )
    .toPairs()
    .map( ([ category, rows ]) => {  

      const children = get_category_children(rows, keys_in_sups);

      const current_value = _.sumBy(children, "data.current_value") || 0;
      const comparison_value = get_comparision_value(rows);

      if (current_doc_is_mains){
        if (current_value === 0){
          return null;
        }
      } else {
        const sup_rows = _.filter(rows, row => keys_in_sups[key_for_table_row(row)]);
        if ( _.isEmpty(sup_rows) ){
          return null;
        }
      }
      
      const is_voted = _.isNumber(_.first(rows).votenum);

      const is_single_item = _.chain(rows).map(row_identifier_func).uniq().value().length === 1;
      const name = (
        is_single_item ?
          `${strip_stat_marker(category)} - ${Dept.lookup(rows[0].dept).name}` :
          strip_stat_marker(category)
      );

      return {
        id: category,
        data: {
          name,
          comparison_value,
          current_value,
          percent_value: calculate_percent_value(current_value, comparison_value),
          amounts_by_doc: get_doc_code_breakdowns(rows),
          is_voted,
        },
        children: (
          is_single_item ? 
            null :
            children
        ),
      };
    })
    .compact()
    .value();

  const vote_stat = _.chain(nested_data)
    .partition("data.is_voted")
    .map( (categories, ix) => {
      const is_voted = ix === 0;

      const current_value = _.sumBy(categories, "data.current_value");
      const comparison_value = _.sumBy(categories, "data.comparison_value")

      if ( !current_value && !comparison_value ){
        return null;
      }

      return {
        id: is_voted ? "voted" : "stat",
        children: categories,
        data: {
          name: text_maker(is_voted ? "voted_items" : "stat_items"),
          current_value,
          comparison_value,
          percent_value: calculate_percent_value(current_value, comparison_value),
        },
        isExpanded: true,
      };

    })
    .value();

  const root = {
    id: 'root',
    data: {},
    children: vote_stat,
  };

  const d3_h7y = d3.hierarchy(root, _.property('children'));
  return convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);
}


const Green = ({children}) => <span style={{color: "hsla(120, 100%, 25%, 1)"}}>{children}</span>
const Red = ({children}) => <span style={{color: "hsla(0, 100%, 40%, 1)"}}>{children}</span>

export const col_defs = [
  {
    id: 'name',
    width: 250,
    textAlign: "left",
    header_display: <TM k="name" />,
    get_val: ({data}) => data.name,
  },
  {
    id: "current_value",
    width: 150,
    textAlign: "right",
    header_display: <TM k="current_doc_this_year" args={{current_doc_is_mains, current_sups_letter}} />,
    get_val: node => _.get(node, "data.current_value"),
    val_display: val => <Format type="compact2" content={val} />,
  },
  {
    id: "comparison_value_pct",
    width: 150,
    textAlign: "right",
    header_display: current_doc_is_mains ? <TM k="previous_mains_comparison_value" /> : <TM k="change_from_comparison_value" />,
    get_val: node => _.get(node, "data.percent_value"),
    val_display: val => {
      let content;
      if( Math.abs( -1-val ) < 0.001){
        return <Red><strong><TM k="item_no_longer_active"/></strong></Red>;
      } else if(val > 10){ //let's consider +1000% to be a new item
        return <Green><strong><TM k="new"/></strong></Green>;
      } else {
        content= <Format type="percentage2" content={Math.abs(val)} />;
      }

      if(val>0){
        return <Green>+{content}</Green>
      } else if(val===0){
        return content;
      } else {
        return <Red>-{content}</Red>
      }
    },
  },
];

function footnote_from_glossary_item(key){
  return () => GlossaryEntry.lookup(key).definition;
}
const central_vote_footnotes = [
  [5 , footnote_from_glossary_item("TB5")],
  [10, footnote_from_glossary_item("TB10")],
  [15, footnote_from_glossary_item("TB15")],
  [25, footnote_from_glossary_item("TB25")],
  [30, footnote_from_glossary_item("TB30")],
  [35, footnote_from_glossary_item("TB33")], //33 has become 35
  [40, _.constant(biv_footnote)],
];

function get_footnotes_for_votestat_item({desc, org_id, votenum}){
  if(+org_id === 326){
    const central_vote_footnote = _.find(
      central_vote_footnotes, 
      ([num]) => votenum === num
    );
    if(central_vote_footnote){
      return [{
        text: central_vote_footnote[1](),
      }];
    }
    
  }
  return ;
}


const scheme_key = "estimates_diff";
const h7y_layout_options = ["org", "item_type"]
export const get_initial_state = (intitial_h7y_layout) => ({
  doc_code: current_doc_code,
  sort_col: "current_value",
  is_descending: true,
  show_stat: true,
  h7y_layout: _.includes(h7y_layout_options, intitial_h7y_layout) ? 
    intitial_h7y_layout : 
    h7y_layout_options[0],
});
export const estimates_diff_scheme = {
  key: scheme_key,
  get_sort_func_selector: () => {
    return createSelector(
      [
        aug_state => aug_state[scheme_key].is_descending, 
        aug_state => aug_state[scheme_key].sort_col, 
      ],
      (is_descending, sort_col) => {
  
        const attr_getter = _.find(col_defs, { id: sort_col }).get_val;
  
        return list => _.chain(list) //sort by search relevance, than the initial sort func
          .sortBy(attr_getter)
          .pipe( is_descending ? _.reverse : _.identity )
          .value();
      }
    );
  },
  get_props_selector: () => augmented_state => _.clone(augmented_state.estimates_diff),
  dispatch_to_props: dispatch => ({ 
    col_click: col_key => dispatch({type: 'column_header_click', payload: col_key }),
    toggle_stat_filter: () => dispatch({type: "toggle_stat_filter"}),
    set_h7y_layout: layout_key => dispatch({type: "set_h7y_layout", payload: layout_key}),
  }),
  reducer: (state=get_initial_state(), action) => {
    const { type, payload } = action;

    if(type === "set_h7y_layout"){ //this should always reset the show_stat filter 
      if(payload === state.h7y_layout){ //if no change, state don't change
        return state;
      }
      return {
        ...state,
        show_stat: true,
        h7y_layout: payload,
      };
    }
    if(type === "toggle_stat_filter"){
      return {
        ...state,
        show_stat: !state.show_stat,
      };
    }
    if(type === 'column_header_click'){
      const { is_descending, sort_col } = state;
      const clicked_col = payload;
      const mods = (
        clicked_col === sort_col ?
          { is_descending: !is_descending } :
          { is_descending: true, sort_col: clicked_col }
      );
      return {...state, ...mods}
    } else {
      return state;
    }
  
  },
  get_base_hierarchy_selector: () => createSelector(
    _.property("estimates_diff.show_stat"),
    _.property("estimates_diff.h7y_layout"),
    (should_show_stat, h7y_layout) => {
      if(h7y_layout === "item_type"){
        return get_data_by_item_types();
      } else {
        return get_data_by_org(should_show_stat);
      }
    }
  ),
  shouldUpdateFlatNodes: (oldSchemeState, newSchemeState) => !shallowEqualObjectsOverKeys(
    oldSchemeState,
    newSchemeState,
    ["show_stat", "h7y_layout"]
  ),
};
