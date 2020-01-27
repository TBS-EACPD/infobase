import './DisplayTable.scss';
import text from '../common_text/common_lang.yaml';
import { create_text_maker_component } from './misc_util_components.js';

import classNames from 'classnames';

import { SortDirections } from './SortDirection.js';

const { text_maker, TM } = create_text_maker_component(text);

export class DisplayTable extends React.Component {
  constructor(props){
    super();
    const {
      sort_keys,
      col_search,
    } = props;
    this.state = {
      sort_by: sort_keys[0],
      descending: true,
      col_search: col_search,
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
      sort_keys,
      table_data_headers,
    } = this.props;
    const {
      sort_by,
      col_search,
      descending,
    } = this.state;

    const lower_case_str_includes = (string, substring) => _.includes(string.toLowerCase().trim(), substring.toLowerCase().trim());
    const sorted_data = _.chain(data)
      .filter(row => {
        return _.reduce(col_search, (result, query, col) => {
          result = result && lower_case_str_includes(row.sort_keys[col], query);
          return result;
        }, true);
      })
      .sortBy(row => _.has(row["sort_keys"],sort_by) ? row["sort_keys"][sort_by] : row[sort_keys[0]]) // careful with sorting, sort keys could be zero/falsey
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
              {
                _.map(column_keys, (tick, i) => {
                  return (
                    _.includes(sort_keys,tick) ?
                      <th 
                        key={i} 
                        className={classNames("center-text", "display-table__sortable")}
                      >
                        {table_data_headers[i]}
                        <div onClick={ () => _.includes(sort_keys,tick) && this.header_click(tick) }>
                          <SortDirections 
                            asc={!descending && sort_by === tick}
                            desc={descending && sort_by === tick}
                          />
                        </div>
                        { !_.isUndefined(col_search[tick]) &&
                          <input
                            type="text"
                            id={tick}
                            style={{ width: "100%", fontWeight: "normal" }}
                            onChange={evt => {
                              const new_query = _.clone(col_search);
                              new_query[evt.target.id] = evt.target.value;
                              this.setState({
                                col_search: new_query,
                              });
                            }}
                            placeholder={text_maker('filter_data')}
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
            {_.map(sorted_data, ({ col_data }, i) => 
              <tr key={i}>
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