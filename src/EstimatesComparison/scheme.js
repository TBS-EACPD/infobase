import { text_maker, TM } from './text-provider';
import { createSelector } from 'reselect';
import { Format } from '../util_components.js';
import { Table } from '../core/TableClass.js';
import FootNote from '../models/footnotes.js';
import {GlossaryEntry} from '../models/glossary.js';
import { Subject } from '../models/subject.js';
import { convert_d3_hierarchy_to_explorer_hierarchy } from '../gen_expl/hierarchy_tools.js';
import { shallowEqualObjectsOverKeys } from '../core/utils';

const { Dept } = Subject;
const biv_footnote = text_maker("biv_footnote");
const this_year_col = "{{est_in_year}}_estimates";
const last_year_col = "{{est_last_year}}_estimates";
const row_identifier_func = row => `${row.dept}-${row.votenum}-${row.desc}`; 

//in this cpn, we don't care about supps
const reduce_by_supps_dim = (rows) => _.chain(rows)
  .groupBy(row_identifier_func)
  .toPairs()
  .map( ([_x, group]) => {
    const [ first ] = group;
    return {
      dept: first.dept,
      desc: first.desc,
      votenum: first.votenum,
      sups: _.chain(group).filter({est_doc_code: "SEA"}).sumBy(this_year_col).value(),
      mains: _.chain(group).filter({est_doc_code: "MAINS"}).sumBy(this_year_col).value(),
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
  .value()

const key_for_table_row = row => `${row.dept}-${row.votenum}-${row.desc}`;
function get_data_by_org(include_stat){

  const keys_in_supps = get_keys_in_supps(include_stat);

  const data = _.chain(Table.lookup('table8').data)
    .pipe(include_stat ? _.identity : rows => _.reject(rows, {votestattype: 999}))
    .pipe( reduce_by_supps_dim )
    .groupBy('dept')
    .toPairs()
    .map( ([org_id, rows]) => {

      const sups_rows = _.filter(rows,row => keys_in_supps[key_for_table_row(row)]);
      if(_.isEmpty(sups_rows)){
        return null;
      }

      const org = Dept.lookup(org_id);
      const sups = _.sumBy(sups_rows, "sups") || 0;
      const mains = _.sumBy(rows, "mains") || 0;
      const inc_pct = sups/mains;

      const amounts_by_doc = get_doc_code_breakdowns( _.flatMap(rows, "_rows") );

      return {
        id: org_id,
        data: {
          name: org.name,
          subject: org,
          sups,
          mains,
          inc_pct,
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
        children: _.map(rows, row => {
          const sups = row["sups"] || 0;
          const mains = row["mains"] || 0;
          const inc_pct = sups/mains;

          return {
            id: `${org_id}-${row.desc}`,
            data: {
              name: row.desc,
              sups,
              mains,
              inc_pct,
              footnotes: get_footnotes_for_votestat_item({
                desc: row.desc, 
                org_id, 
                votenum: row.votenum,
              }),
              amounts_by_doc: get_doc_code_breakdowns(row._rows),
            },
          };
        }),
      };


    })
    .compact()
    .value();

  const root = {
    id: "root",
    data: {},
    children: data,
  };

  const d3_h7y = d3.hierarchy(root, _.property('children'));
  return convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);

}

const strip_stat_marker = str => str.indexOf("(S) ") > -1 ? str.split("(S) ")[1] : str;

const get_category_children = (rows) => _.chain(rows)
  .pipe(reduce_by_supps_dim)
  .map(new_row => {
    const { votenum, desc, dept } = new_row;
    const mains = new_row.mains || 0;
    const sups = new_row.sups || 0;
    const inc_pct = sups/mains;

    if(!sups){
      return null;
    }

    return {
      id: `${dept}-${votenum}-${desc}`,
      data: {
        name: `${Dept.lookup(dept).name} - ${strip_stat_marker(desc)}`,
        mains,
        sups,
        inc_pct,
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
  const keys_in_supps = get_keys_in_supps(true);
  
  const nested_data = _.chain( Table.lookup('table8').major_voted_big_stat([this_year_col,last_year_col], false, false) )
    .toPairs()
    .map( ([ category, rows ]) => {  

      const sup_rows = _.filter(rows, row => keys_in_supps[key_for_table_row(row)]);
      if( _.isEmpty(sup_rows)){
        return null;
      }
      const children = get_category_children(rows, keys_in_supps);

      const sups = _.sumBy(children, "data.sups") || 0;
      const mains = _.chain(rows).filter({est_doc_code: "MAINS"}).sumBy(this_year_col).value();
      const inc_pct = sups/mains;

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
          mains,
          sups,
          inc_pct,
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
      const sups = _.sumBy(categories,"data.sups");
      const mains = _.sumBy(categories,"data.mains")
      const inc_pct = sups/mains;

      return {
        id: is_voted ? "voted" : "stat",
        children: categories,
        data: {
          name: text_maker(is_voted ? "voted_items" : "stat_items"),
          sups,
          mains,
          inc_pct,
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


function get_keys_in_supps(include_stat){
  return _.chain(Table.lookup('table8').data)
    .pipe(include_stat ? _.identity : rows => _.reject(rows, {votestattype: 999}))
    .filter(row => row[this_year_col] && row.est_doc_code === "SEA")
    .map(row => [key_for_table_row(row),1] )
    .fromPairs()
    .value();
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
    id: "sups",
    width: 150,
    textAlign: "right",
    header_display: <TM k="supps_a_this_year" />,
    get_val: node => _.get(node, "data.sups"),
    val_display: val => <Format type="compact1" content={val} />,
  },
  {
    id: "mains_pct",
    width: 150,
    textAlign: "right",
    header_display: <TM k="change_from_mains" />,
    get_val: node => _.get(node, "data.inc_pct"),
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
export const initial_state = {
  sort_col: "sups",
  is_descending: true,
  show_stat: true,
  h7y_layout: "item_type",
};
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
    toggle_stat_filter: ()=> dispatch({type: "toggle_stat_filter"}),
    set_h7y_layout: layout_key=> dispatch({type: "set_h7y_layout", payload: layout_key}),
  }),
  reducer: (state=initial_state, action) => {
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
      return {...state,...mods}
    } else {
      return state;
    }
  
  },
  get_base_hierarchy_selector: () => createSelector(
    _.property("estimates_diff.show_stat"),
    _.property("estimates_diff.h7y_layout"),
    (should_show_stat, h7y_layout) => {
      if(h7y_layout === "org"){
        return get_data_by_org(should_show_stat);
      } else {
        return get_data_by_item_types();
      }
    }
  ),
  shouldUpdateFlatNodes: (oldSchemeState, newSchemeState) => !shallowEqualObjectsOverKeys(
    oldSchemeState,
    newSchemeState,
    ["show_stat", "h7y_layout"]
  ),
};
