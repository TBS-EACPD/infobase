import './DisplayTable.scss';

import text from '../common_text/common_lang.yaml';
import { create_text_maker_component } from './misc_util_components.js';

import { SortDirections } from './SortDirection.js';
import { DebouncedTextInput } from './DebouncedTextInput.js';

const { text_maker, TM } = create_text_maker_component(text);

export class DisplayTable extends React.Component {
  constructor(props){
    super(props);

    this.sort_click.bind(this);

    const { rows } = props;

    const { sort_values, search_values } = _.first(rows);

    const sort_by = _.chain(sort_values)
      .keys()
      .first()
      .value();

    const searches = _.mapValues(
      search_values,
      () => "",
    );

    this.state = {
      sort_by,
      descending: true,
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
      name,
      column_names,
      rows,
    } = this.props;
    const {
      sort_by,
      descending,
      searches,
    } = this.state;

    const ordered_column_keys = _.keys(column_names);

    const clean_search_string = (search_string) => _.chain(search_string).deburr().toLower().trim().value();
    const sorted_filtered_data = _.chain(rows)
      .filter(
        ({search_values}) => _.chain(search_values)
          .map( (search_value, column_key) => (
            _.isEmpty(searches[column_key]) ||
            _.includes(
              clean_search_string(search_value),
              clean_search_string(searches[column_key])
            )
          ) )
          .every()
          .value()
      )
      .sortBy( ({sort_values}) => sort_values[sort_by] )
      .tap( descending ? _.noop : _.reverse )
      .value();

    return (
      <div style={{overflowX: "auto", marginTop: "20px", marginBottom: "20px"}}>
        <table className="table display-table no-total-row">
          <caption className="sr-only">
            <div>
              { 
                !_.isEmpty(name) ? 
                  name :
                  <TM k="a11y_table_title_default" />
              }
            </div>
          </caption>
          <thead>
            <tr className="table-header">
              {
                _.map(
                  column_names,
                  (name, i) => <th
                    key={i} 
                    className={"center-text"}
                  >
                    {name}
                  </th>
                )
              }
            </tr>
            <tr className="table-header">
              { rows.length > 0 &&
                _.chain(rows)
                  .first()
                  .thru(
                    ({sort_values, search_values}) => _.map(
                      ordered_column_keys,
                      (column_key) => {
                        const sortable = _.has(sort_values, column_key);
                        const searchable = _.has(search_values, column_key);
      
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
                  )
                  .value()
              }
            </tr>
          </thead>
          <tbody>
            {_.map(
              sorted_filtered_data, 
              ({ display_values }, i) => (
                <tr key={i}>
                  {_.map(
                    ordered_column_keys,
                    col => (
                      <td key={col}>
                        {display_values[col]}
                      </td>
                    )
                  )}
                </tr>
              )
            )}
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