import { util_components, general_utils } from '../panels/shared.js';
const { Sorters } = util_components;

import { TM } from './TextMaker.js';

export class DisplayTable extends React.Component {
  constructor(props){
    super();
    this.state = {
      sort_by: _.keys(props.status_columns)[0],
      descending: true,
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
    } = this.props;
    const { sort_by, descending, show_all } = this.state;


    // TODO: implement filtering
    const sorted_filtered_data = _.chain(data)
      .sortBy(
        sort_by==='label' ? 
          row => row["label"] :
          row => row["col_data"][sort_by]["sort_key"]
      )
      .tap(descending ? _.noop : _.reverse)
      .value();

    return (
      <div style={{overflowX: "auto"}}>
        <table className="table table-dark-blue table-dark-bordered no-total-row">
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
                <TM k="org" />
                <Sorters 
                  asc={!descending && sort_by === "label"} 
                  desc={descending && sort_by === "label"}
                />
              </th>
              {
                _.map(column_keys, (tick, i) => {
                  return (
                    <th 
                      key={i} 
                      className="center-text"
                      onClick={ () => this.header_click(tick) }
                    >
                      <TM k={tick} />
                      <Sorters 
                        asc={!descending && sort_by === i} 
                        desc={descending && sort_by === i}
                      />
                    </th>
                  );
                })
              }
            </tr>
          </thead>
          <tbody>
            {_.map(sorted_filtered_data, ({ label, col_data }, i) => 
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