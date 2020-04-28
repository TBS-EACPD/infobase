import './DisplayTable.scss';

import classNames from 'classnames';
import text from '../common_text/common_lang.yaml';
import { Subject } from "../models/subject.js";
import { create_text_maker_component, Format } from './misc_util_components.js';

import { SortDirections } from './SortDirection.js';
import { DebouncedTextInput } from './DebouncedTextInput.js';

const { text_maker, TM } = create_text_maker_component(text);
const { Dept } = Subject;

export class DisplayTable extends React.Component {
  constructor(props){
    super(props);

    this.sort_click.bind(this);

    const {
      unsorted_initial,
      column_configs,
    } = props;

    const sort_by = unsorted_initial ? null :
      _.chain(column_configs)
        .pickBy(col => col.is_sortable)
        .keys()
        .first()
        .value();
    
    const searches = _.chain(column_configs)
      .pickBy(col => col.is_searchable)
      .mapValues( () => "" )
      .value();

    this.state = {
      sort_by,
      descending: !unsorted_initial,
      searches,
    };
  }

  sort_click(column_key){
    this.setState({
      sort_by: column_key,
      descending: (
        this.state.sort_by === column_key ?
          !this.state.descending :
          true
      ),
    });
  }

  render(){
    const {
      table_name, // Optional: Name of table
      data, // [ {column_key: 134} ]
      column_configs, /* {
        column_key: {
          index: 0, <- (integer) Zero indexed, order of column. Required
          header: "Organization", <- (string) Name of column. Required
          is_sortable: true, <- (boolean) Default sorts based on column values (number, string, Date supported)
          is_summable: true, <- (boolean) Sums based on column values
          is_searchable: true, <- (boolean) Searches based on column values
          formatter:
            "big_int" <- (string) If it's string, auto formats using types_to_format
            OR
            (value) => <span> {value} </span>, <- (function)  If it's function, column value is passed in
          sort_func: (a, b) => ... (function) Custom sort function. See use cases "sort_func_template"
          search_formatter: (value) => Dept.lookup(value).name <- (function) actual value to search from data
        },
      }
      */
    } = this.props;
    const {
      sort_by,
      descending,
      searches,
    } = this.state;

    const clean_search_string = (search_string) => _.chain(search_string).deburr().toLower().trim().value();
    const is_number_string_date = (val) => _.isNumber(val) || _.isString(val) || _.isDate(val);
    const sorted_filtered_data = _.chain(data)
      .filter( (row) => _.chain(row)
        .map( (column_value, column_key) => {
          const col_config = column_configs[column_key];
          const col_search_value = col_config.search_formatter ? col_config.search_formatter(column_value) : column_value;
          return _.isEmpty(searches[column_key]) ||
            _.includes(
              clean_search_string(col_search_value),
              clean_search_string(searches[column_key])
            );
        })
        .every()
        .value()
      )
      .thru( unsorted_array => {
        if(sort_by) {
          return column_configs[sort_by].sort_func ?
            unsorted_array.sort((a, b) => column_configs[sort_by].sort_func(a[sort_by], b[sort_by])) :
            _.sortBy(unsorted_array, row =>
            is_number_string_date(row[sort_by]) ?
              row[sort_by] :
              Number.NEGATIVE_INFINITY
            );
        }
        return unsorted_array;
      })
      .tap( descending ? _.reverse : _.noop )
      .value();
    
    const total_row = _.reduce(
      sorted_filtered_data,
      (totals, row) => _.mapValues(
        totals,
        (total, col_key) => total + row[col_key]
      ),
      _.chain(column_configs)
        .pickBy(col => col.is_summable)
        .mapValues(col => 0)
        .value()
    );
    const is_total_exist = !_.isEmpty(total_row);

    const ordered_column_keys = _.chain(column_configs)
      .map( ({index}, key) => [index, key] )
      .sortBy( _.first )
      .map( _.last )
      .value();

    const default_true = (val) => _.isUndefined(val) || val ? true : false;

    return (
      <div style={{overflowX: "auto", marginTop: "20px", marginBottom: "20px"}}>
        <table className={classNames("table", "display-table", !is_total_exist && "no-total-row")}>
          <caption className="sr-only">
            <div>
              { 
                !_.isEmpty(table_name) ? 
                table_name :
                  <TM k="a11y_table_title_default" />
              }
            </div>
          </caption>
          <thead>
            <tr className="table-header">
              {
                _.map(
                  ordered_column_keys,
                  (column_key, i) => <th
                    key={i} 
                    className={"center-text"}
                  >
                    {column_configs[column_key].header}
                  </th>
                )
              }
            </tr>
            <tr className="table-header">
              {
                _.map(
                  ordered_column_keys,
                  (column_key) => {
                    const sortable = default_true(column_configs[column_key].is_sortable);
                    const searchable = column_configs[column_key].is_searchable;

                    const current_search_input = (searchable && searches[column_key]) || null;

                    return (
                      <th 
                        key={column_key}
                        style={{textAlign: "center"}}
                      >
                        { sortable &&
                          <div onClick={ () => this.sort_click(column_key) }>
                            <SortDirections 
                              asc={!descending && sort_by === column_key}
                              desc={descending && sort_by === column_key}
                            />
                          </div>
                        }
                        { searchable &&
                          <DebouncedTextInput
                            inputClassName={"search input-sm"}
                            placeHolder={text_maker('filter_data')}
                            defaultValue={current_search_input}
                            updateCallback={ (search_value) => {
                              const updated_searches = _.mapValues(
                                searches,
                                (value, key) => key === column_key ? 
                                  search_value :
                                  value
                              );

                              this.setState({ searches: updated_searches });
                            }}
                            debounceTime={300}
                          />
                        }
                      </th>
                    );
                  }
                )
              }
            </tr>
          </thead>
          <tbody>
            {_.map(
              sorted_filtered_data, 
              (row, i) => (
                <tr key={i}>
                  {_.map(
                    ordered_column_keys,
                    col_key => (
                      <td style={{fontSize: "14px"}} key={col_key}>
                        {column_configs[col_key].formatter ?
                          _.isString(column_configs[col_key].formatter) ?
                            <Format type={column_configs[col_key].formatter} content={row[col_key]} /> :
                            column_configs[col_key].formatter(row[col_key]) : 
                          row[col_key]}
                      </td>
                    ))}
                </tr>
              )
            )}
            { is_total_exist &&
              <tr key="total_row">
                <td>{text_maker("total")}</td>
                { _.chain(ordered_column_keys)
                  .tail()
                  .map(col_key => (
                    <td key={col_key}>
                      { total_row[col_key] ?
                          column_configs[col_key].formatter ?
                            _.isString(column_configs[col_key].formatter) ?
                              <Format type={column_configs[col_key].formatter} content={total_row[col_key]} /> :
                              column_configs[col_key].formatter(total_row[col_key]) :
                            total_row[col_key] :
                          ""
                      }
                    </td>
                  ))
                  .value()
                }
              </tr>
            }
          </tbody>
        </table>
        { sorted_filtered_data.length === 0 &&
          <TM 
            k="no_data" 
            el="div" 
            style={{width: "100%", textAlign: "center"}} 
          />
        }
      </div>
    );
  }
}
export const sort_func_template = (a_name, b_name) => {
  if(a_name < b_name) {
    return -1;
  } else if (a_name > b_name) {
    return 1;
  }
  return 0;
};

export const default_dept_name_sort_func = (a, b) => {
  if(a && b) {
    const a_name = Dept.lookup(a).name.toUpperCase();
    const b_name = Dept.lookup(b).name.toUpperCase();
    return sort_func_template(a_name, b_name);
  }
  return 0;
};