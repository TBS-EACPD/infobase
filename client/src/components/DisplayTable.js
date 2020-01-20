import './DisplayTable.scss';
import text from '../common_text/result_lang.yaml';
import { create_text_maker_component } from './misc_util_components.js';

import classNames from 'classnames';

import { SortDirections } from './SortDirection.js';

const { text_maker, TM } = create_text_maker_component(text);

export class DisplayTable extends React.Component {
  constructor(props){
    super();
    this.state = {
      sort_by: "label",
      descending: true,
      indicator_query: "",
      activity_query: "",
    };
  }

  header_click(col_name){
    this.setState({
      sort_by: col_name,
      descending: (
        this.state.sort_by === col_name ?
          !this.state.descending :
          true
      ),
    });
  }

  render(){
    const {
      column_keys,
      data,
      table_name,
      label_col_header,
      sort_keys,
      table_data_headers,
    } = this.props;
    const {
      sort_by,
      activity_query,
      indicator_query,
      descending,
    } = this.state;

    const lower_case_str_includes = (string, substring) => _.includes(string.toLowerCase().trim(), substring.toLowerCase().trim());
    const sorted_data = _.chain(data)
      .filter(row => lower_case_str_includes(row.sort_keys.label, activity_query) && lower_case_str_includes(row.sort_keys.indicator, indicator_query))
      .sortBy(row => _.has(row["sort_keys"],sort_by) ? row["sort_keys"][sort_by] : row["label"]) // careful with sorting, sort keys could be zero/falsey
      .tap(descending ? _.noop : _.reverse)
      .value();

    return (
      <div style={{overflowX: "auto", marginTop: "20px", marginBottom: "20px"}}>
        <table className="table display-table no-total-row">
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
              <th 
                className="center-text"
              >
                {label_col_header || ""}
                <div
                  onClick={ () => this.header_click("label") }
                >
                  <SortDirections 
                    asc={!descending && sort_by === "label"} 
                    desc={descending && sort_by === "label"}
                  />
                </div>
                <input
                  type="text"
                  style={{width: "100%"}}
                  value={activity_query}
                  onChange={evt => 
                    this.setState({ activity_query: evt.target.value })
                  }
                  placeholder={text_maker('filter_results')}
                />
              </th>
              {
                _.map(column_keys, (tick, i) => {
                  return (
                    _.includes(sort_keys,tick) ?
                      <th 
                        key={i} 
                        className={classNames("center-text", "display-table__sortable")}
                      >
                        {table_data_headers[i]}
                        <div
                          onClick={ () => _.includes(sort_keys,tick) && this.header_click(tick) }
                        >
                          <SortDirections 
                            asc={!descending && sort_by === tick} 
                            desc={descending && sort_by === tick}
                          />
                        </div>
                        { tick === "indicator" &&
                          <input
                            type="text"
                            style={{width: "100%"}}
                            value={indicator_query}
                            onChange={evt => 
                              this.setState({ indicator_query: evt.target.value })
                            }
                            placeholder={text_maker('filter_results')}
                          />
                        }
                      </th> :
                      <th 
                        key={i} 
                        className={"center-text"}
                      >
                        {table_data_headers[i]}
                      </th>
                  );
                })
              }
            </tr>
          </thead>
          <tbody>
            {_.map(sorted_data, ({ label, col_data }, i) => 
              <tr key={i}>
                <th 
                  scope={
                    !label_col_header ?
                    "row" :
                    null
                  }
                >
                  { label }
                </th> 
                {_.map(
                  column_keys, 
                  col => (
                    <td key={col}>
                      {col_data[col]}
                    </td>
                  )
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}