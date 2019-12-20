import { 
  TrivialTM as TM,
  Format,
} from '../components/index.js';
import { result_docs } from '../models/results.js';

import { createSelector } from 'reselect';



export const get_col_defs = ({doc}) => [
  {
    id: 'name',
    width: 250,
    textAlign: "left",
    header_display: <TM k="name" />,
    get_val: ({data}) => data.name,
  },
  {
    id: "spending",
    width: 150,
    textAlign: "right",
    header_display: (
      <TM 
        k={ 
          /dp/.test(doc) ? 
            "planned_spending_header" : 
            'actual_spending_header' 
        }
        args={{
          year: _.first(result_docs[doc].resource_years),
        }}
      />
    ),
    get_val: node => _.get(node, "data.resources.spending"),
    val_display: val => _.isNumber(val) ? <Format type="compact1" content={val} /> : null,
  },
  {
    id: "ftes",
    width: 150,
    textAlign: "right",
    header_display: (
      <TM 
        k={ 
          /dp/.test(doc) ? 
            "planned_ftes_header" : 
            'actual_ftes_header' 
        }
        args={{
          year: _.first(result_docs[doc].resource_years),
        }}
      />
    ),
    get_val: node => _.get(node, "data.resources.ftes"),
    val_display: val => _.isNumber(val) ? <Format type="big_int" content={val} /> : null,
  },
];


export const provide_sort_func_selector = (scheme_key) => {
  const attr_getters = {
    ftes: node => _.get(node,'data.resources.ftes') || 0,
    spending: node => _.get(node,"data.resources.spending") || 0,
    name: node => node.data.name,
  };

  const reverse_array = arr => _.clone(arr).reverse();
  
  return createSelector(
    [
      aug_state => aug_state[scheme_key].is_descending, 
      aug_state => aug_state[scheme_key].sort_col, 
    ],
    (is_descending, sort_col) => {

      const attr_getter = attr_getters[sort_col];

      return list => _.chain(list) //sort by search relevance, than the initial sort func
        .sortBy(attr_getter)
        .pipe( is_descending ? reverse_array : _.identity )
        .value();
    }
  );
};