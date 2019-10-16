import './DisplayTable.scss';
import classNames from 'classnames';
import { util_components } from '../panels/shared.js';
const {
  SortDirections,
} = util_components;

import { TM } from './TextMaker.js';

export class DisplayTable extends React.Component {
  constructor(props){
    super();
    this.state = {
      sort_by: "label",
      descending: true,
      filter_by: undefined,
      filter: undefined,
      show_all: false,
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
      descending,
    } = this.state;
  

    const sorted_data = _.chain(data)
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
                onClick={ () => this.header_click("label") }
              >
                {label_col_header || ""}
                <SortDirections 
                  asc={!descending && sort_by === "label"} 
                  desc={descending && sort_by === "label"}
                />
              </th>
              {
                _.map(column_keys, (tick, i) => {
                  return (
                    _.includes(sort_keys,tick) ?
                      <th 
                        key={i} 
                        className={classNames("center-text", "display-table__sortable")}
                        onClick={ () => _.includes(sort_keys,tick) && this.header_click(tick) }
                      >
                        {table_data_headers[i]}
                        <SortDirections 
                          asc={!descending && sort_by === tick} 
                          desc={descending && sort_by === tick}
                        />
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