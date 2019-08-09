import { TextMaker } from '../components/index.js';

export class A11YTable extends React.PureComponent {
  render(){
    const {
      data, 
      label_col_header, //optional
      data_col_headers, 
      table_name, //optional 
    } = this.props;

    return (
      <div style={{overflow: "auto"}}>
        <table
          className="table table-striped table-bordered"
        >
          <caption>
            <div> 
              { 
                !_.isEmpty(table_name) ? 
                table_name : 
                <TextMaker text_key="a11y_table_title_default" />
              }
            </div> 
          </caption>
          <thead>
            <tr>
              <th 
                scope={
                  label_col_header ? 
                  "col" :
                  null
                }
              >
                {label_col_header || ""}
              </th>
              {_.map(data_col_headers, (tick,i) => <th key={i}> <span dangerouslySetInnerHTML={{__html: tick}} /> </th>)} 
            </tr>
          </thead>
          <tbody>
            {_.map(data, ({label, data}) => 
              <tr key={label}>
                <th 
                  scope={
                    !label_col_header ?
                    "row" :
                    null
                  }
                >
                  {label}
                </th>
                {
                  _.isArray(data) ? 
                  _.map(data, (d,i) => <td key={i}> {d} </td> ) :
                  <td> {data} </td>
                }
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}