import './DiffView.ib.yaml';
import { createSelector } from 'reselect';
import { text_maker } from '../models/text.js';
import {
  TM,
  Format,
} from '../util_components.js';
import { Table } from '../core/TableClass.js';
import { Dept } from '../models/subject.js';
import FootNote from '../models/footnotes.js';

import { convert_d3_hierarchy_to_explorer_hierarchy } from '../gen_expl/hierarchy_tools.js';


const biv_footnote = text_maker("biv_footnote");

const this_year_col = "{{est_in_year}}_estimates";
const last_year_col = "{{est_last_year}}_estimates";


//in this cpn, we don't care about supps
const reduce_by_supps_dim = (rows) => _.chain(rows)
  .groupBy( row => `${row.dept}-${row.votenum}-${row.desc}`)
  .toPairs()
  .map( ([_x, group]) => {
    const [ first ] = group;
    return {
      dept: first.dept,
      desc: first.desc,
      this_year: _.sumBy(group, this_year_col) || 0,
      last_year: _.sumBy(group, last_year_col) || 0,
      last_year_mains: _.chain(group).filter({est_doc_code: "MAINS"}).sumBy(last_year_col).value(),
    };
  })
  .value();


function get_data(include_stat){
  const data = _.chain(Table.lookup('table8').data)
    .pipe(include_stat ? _.identity : rows => _.reject(rows, {votestattype: 999}))
    .filter(obj => obj[this_year_col] || obj[last_year_col] )
    .pipe( reduce_by_supps_dim )
    .groupBy('dept')
    .toPairs()
    .map( ([org_id, rows]) => {

      const org = Dept.lookup(org_id);
      const this_year = _.sumBy(rows, "this_year") || 0;
      const last_year  = _.sumBy(rows, "last_year") || 0;
      const last_year_mains = _.sumBy(rows, "last_year_mains") || 0;
      const inc = this_year-last_year_mains;
      const inc_pct = inc/last_year_mains;

      return {
        id : org_id,
        data: {
          name: org.name,
          subject: org,
          this_year,
          last_year,
          last_year_mains,
          inc,
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
        },
        children: _.map(rows, row => {
          const this_year = row["this_year"] || 0;
          const last_year_mains  = row["last_year_mains"] || 0;
          const inc = this_year-last_year_mains;
          const inc_pct = inc/last_year_mains;

          const is_biv = org_id === "326" && row.desc && row.desc.indexOf("40") > -1;

          return {
            id: `${org_id}-${row.desc}`,
            data: {
              noExpand: !is_biv, //prevents the ► character from being displayed
              name: row.desc,
              this_year,
              last_year: row.last_year || 0,
              last_year_mains,
              inc,
              inc_pct,
              footnotes: is_biv && [{text: biv_footnote}],
            },
          };
        }),
      };


    })
    .value();

  const root = {
    id: "root",
    data: {},
    children: data,
  };

  const d3_h7y = d3.hierarchy(root, _.property('children'));
  return convert_d3_hierarchy_to_explorer_hierarchy(d3_h7y);

}

const Green = ({children}) => <span style={{color:"hsla(120, 100%, 25%, 1)"}}>{children}</span>
const Red = ({children}) => <span style={{color:"hsla(0, 100%, 40%, 1)"}}>{children}</span>

export const col_defs = [
  {
    id: 'name',
    width: 250,
    textAlign: "left",
    header_display: <TM k="name" />,
    get_val: ({data}) => data.name,
  },
  {
    id: "this_year",
    width: 150,
    textAlign: "right",
    header_display: "2018-19 Authorities",
    get_val: node => _.get(node, "data.this_year"),
    val_display: val => <Format type="compact1" content={val} />,
  },
  {
    id: "inc",
    width: 150,
    textAlign: "right",
    header_display: "Change from last year's main estimates",
    get_val: node => _.get(node, "data.inc"),
    val_display: val => {
      const content = <Format type="compact1" content={Math.abs(val)} />;
      if(val>0){
        return <Green>+{content}</Green>;
      } else if(val === 0){
        return content;
      } else {
        return <Red>-{content}</Red>;
      }

    },
  },
  {
    id: "inc_pct",
    width: 150,
    textAlign: "right",
    header_display: "Change from last year's main estimates (%)",
    get_val: node => _.get(node, "data.inc_pct"),
    val_display: val => {
      let content;
      if( Math.abs( -1-val ) < 0.001){
        return <Red><strong><TM k="old"/></strong></Red>;
      } else if(val > 10){ //let's consider +1000% to be a new item
        return <Green><strong><TM k="new"/></strong></Green>;
      } else {
        content= <Format type="percentage1" content={Math.abs(val)} />;
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


const scheme_key = "estimates_diff";
export const initial_state = {
  sort_col: "inc",
  is_descending: true,
  show_stat: true,
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
  
        const attr_getter = _.find(col_defs, { id:sort_col }).get_val;
  
        return list => _.chain(list) //sort by search relevance, than the initial sort func
          .sortBy(attr_getter)
          .pipe( is_descending ? _.reverse : _.identity )
          .value();
      }
    );
  },
  get_props_selector: () => augmented_state => _.clone(augmented_state.estimates_diff),
  dispatch_to_props: dispatch => ({ 
    col_click : col_key => dispatch({type: 'column_header_click', payload: col_key }),
    toggle_stat_filter: ()=> dispatch({type: "toggle_stat_filter"}),
  }),
  reducer: (state=initial_state, action) => {
    const { type, payload } = action;
    if(type === "toggle_stat_filter"){
      return _.immutate(state, {
        show_stat: !state.show_stat,
      });
    }
    if(type === 'column_header_click'){
      const { is_descending, sort_col } = state;
      const clicked_col = payload;
      const mods = (
        clicked_col === sort_col ?
        { is_descending : !is_descending } :
        { is_descending: true, sort_col : clicked_col }
      );
      return _.immutate(state, mods);
    } else {
      return state;
    }
  
  },
  get_base_hierarchy_selector: () => createSelector(
    _.property("estimates_diff.show_stat"),
    should_show_stat => get_data(should_show_stat)
  ),
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState){
    return oldSchemeState.show_stat !== newSchemeState.show_stat;
  },
};

