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
      column_config,
    } = props;

    const sort_by = unsorted_initial ? null : _.first(column_config.sort);
    
    const searches = _.chain(column_config.search)
      .map(search_key => [search_key, ""])
      .fromPairs()
      .value();

    this.state = {
      sort_by,
      descending: unsorted_initial ? null : true,
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
      column_names, // { column_key: column_name, column_key2: column_name2 }
      ordered_column_keys, // [column_key, column_key2]
      data, /* 
      [
        {
          column_without_any_display_formats: {
            value: 1, **required
          }
          column_with_display_format_in_column_config: {
            format_type: "big_int"
            value: 10, **required
          }
        }
      ]
      */
      column_config, /* Everything Optional
        {
          sort: [column_key, column_key2]
          search: [column_key]
          total: {column_key2: "big_int"}
          display: {
            column_key: ({format_type, value}) => <Format type={format_type} content={value}/>
          }
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
        .map( (column, column_key) => (
          _.isEmpty(searches[column_key]) ||
            _.includes(
              clean_search_string(column.value),
              clean_search_string(searches[column_key])
            )
        ) )
        .every()
        .value()
      )
      .sortBy( row => ( row[sort_by] && _.isNumber(row[sort_by].value) )
        ? row[sort_by].value : Number.NEGATIVE_INFINITY )
      .tap( descending ? _.reverse : _.noop )
      .value();
    
    const total_row = _.reduce(
      sorted_filtered_data,
      (totals, row) => _.mapValues(
        totals,
        (total, col_key) => total + row[col_key].value
      ),
      _.mapValues(column_config.total, () => 0)
    );
    return (
      <div style={{overflowX: "auto", marginTop: "20px", marginBottom: "20px"}}>
        <table className={classNames("table", "display-table", !column_config.total && "no-total-row")}>
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
                  column_names,
                  (col_name, i) => <th
                    key={i} 
                    className={"center-text"}
                  >
                    {col_name}
                  </th>
                )
              }
            </tr>
            <tr className="table-header">
              { sorted_filtered_data.length > 0 &&
                _.map(
                  ordered_column_keys,
                  (column_key) => {
                    const sortable = _.includes(column_config.sort, column_key);
                    const searchable = _.includes(column_config.search, column_key);

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
                    col => (
                      <td style={{fontSize: "14px"}} key={col}>
                        {column_config.display[col] ?
                          column_config.display[col](row[col]) : row[col].value}
                      </td>
                    ))}
                </tr>
              )
            )}
            { column_config.total &&
              <tr key="total_row">
                <td>{text_maker("total")}</td>
                { _.chain(ordered_column_keys)
                  .tail()
                  .map(col => (
                    <td key={col}>
                      { total_row[col] ? 
                        <Format type={column_config.total[col]} content={total_row[col]}/> : 
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