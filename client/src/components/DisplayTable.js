import './DisplayTable.scss';

import classNames from 'classnames';
import text from '../common_text/common_lang.yaml';
import { create_text_maker_component, Format } from './misc_util_components.js';

import { SortDirections } from './SortDirection.js';
import { DebouncedTextInput } from './DebouncedTextInput.js';

const { text_maker, TM } = create_text_maker_component(text);

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
      .keys()
      .map(search_key => [search_key, ""])
      .fromPairs()
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
          is_sortable: true, <- (boolean) Default sorts based on column values alphabetically or numerically. Otherwise, must define sort_func config
          is_summable: true, <- (boolean) Sums based on column values
          is_searchable: true, <- (boolean) Searches based on column values
          formatter:
            "big_int" <- (string) If it's string, auto formats using types_to_format
            OR
            (value) => <span> {value} </span>, <- (function)  If it's function, column value is passed in
          sort_func: (value) => new Date(value) <- (function) Column value is passed in for custom sort function
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
    const sorted_filtered_data = _.chain(data)
      .filter( (row) => _.chain(row)
        .map( (column_value, column_key) => (
          _.isEmpty(searches[column_key]) ||
            _.includes(
              clean_search_string(column_value),
              clean_search_string(searches[column_key])
            )
        ) )
        .every()
        .value()
      )
      .sortBy( row => row[sort_by] && (
        column_configs[sort_by].sort_func ?
        column_configs[sort_by].sort_func(row[sort_by]) :
        ( _.isNumber(row[sort_by]) || _.isString(row[sort_by]) ) ?
          row[sort_by] :
          Number.NEGATIVE_INFINITY
      ) )
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

    const ordered_column_keys = _.reduce( column_configs, (ordered_arr, column, column_key) => {
      ordered_arr.splice(column.index, 0, column_key);
      return ordered_arr;
    }, [] );

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
                    const sortable = column_configs[column_key].is_sortable;
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