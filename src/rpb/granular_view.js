import { TextMaker, text_maker } from './rpb_text_provider.js';
import { 
  SelectList, 
  ReportDetails, 
  ReportDatasets, 
  NoDataMessage, 
  AlertMessage,
} from './shared.js';
import { 
  Format, 
  TwoLevelSelect, 
  SortIndicators, 
  LabeledBox,
} from '../util_components.js';
import { Details } from '../components/Details.js';
import classNames from 'classnames';
import { Subject } from '../models/subject.js';

const { Dept } = Subject;
const PAGE_SIZE = 600;

class GranularView extends React.Component {

  render() {
    const {
      subject,
      table,
      dimension,
      filter,
      columns,

      flat_data,
      all_data_columns,
      filters_by_dimension,

      on_toggle_col_nick,
      on_set_filter,
    } = this.props;

    return (
      <div>
        <LabeledBox
          label={ <TextMaker text_key="blue_text_table_controls" /> }
          content={
            <div className="row">
              <div className='col-md-6'>
                <div className="rpb-config-item col-selection granular">
                  <label className="rpb-config-header" > <TextMaker text_key="select_columns" /> </label>
                  <SelectList 
                    items={ _.map(
                      all_data_columns, 
                      ({nick, fully_qualified_name}) => ({
                        id: nick, 
                        display: fully_qualified_name, 
                      }) 
                    )}
                    selected={ _.map(columns,'nick') }
                    is_multi_select={true}
                    onSelect={id=> on_toggle_col_nick(id) }
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className='rpb-config-header' htmlFor='filt_select'> Filter </label>
                <TwoLevelSelect
                  className="form-control form-control-ib"
                  id="filt_select"
                  onSelect={ id=> {
                    const [ dim_key, filt_key ] = id.split('__');
                    on_set_filter({filter: filt_key, dimension: dim_key});
                  }}
                  selected={dimension+'__'+filter}
                  grouped_options={filters_by_dimension}
                />
                <div className="mrgn-tp-lg">
                  <ExportButton 
                    id="export_button"
                    get_csv_string={ ()=> this.get_csv_string() }
                    get_excel_string={ ()=> {
                      const el = document.createElement('div');
                      ReactDOM.render(this.get_plain_table_content(true), el)
                      const excel_str= el.querySelector('table').outerHTML;
                      ReactDOM.unmountComponentAtNode(el);
                      return excel_str;
                    }}
                  />
                </div>
              </div>
              <div className='clearfix'/>
            </div>
          }
        />
        <LabeledBox
          label={ <TextMaker text_key="blue_text_report_details" args={{table_name: table.name}} /> }
          content={
            <Details
              summary_content={
                <div>
                  { table.title } : {subject.name}  
                </div>
              }
              content={
                <ReportDetails {...this.props} />
              }
            />
          }
        />
        <LabeledBox
          label={ <TextMaker text_key="blue_text_report_data_sources" /> }
          content={ <ReportDatasets {...this.props} /> }
        />
        <div id="rpb-main-content" >
          <AlertMessage table={table} />
          { 
          _.isEmpty(flat_data) ? 
          <NoDataMessage /> :
          this.get_plain_table_content()
          }
        </div>
      </div>
    )


  }

  get_plain_table_content(excel_mode=false){
    const {
      table,
      columns: data_columns,
      sort_col,
      page_num,
      flat_data,
      descending,
      sorted_key_columns,

      on_header_click,
      on_set_page,
    } = this.props;

    const pages = _.chunk(flat_data, PAGE_SIZE);
    const shown_rows = pages[page_num];

    const sortDirection = descending ? "DESC" : "ASC";

    const non_dept_key_cols = _.reject(sorted_key_columns, {nick: 'dept'});


    const totals_by_nick = _.chain(data_columns)
      .map( ({nick, formula}) => [ nick, formula(flat_data) ] )
      .fromPairs()
      .value();

    return (
      <div>
        <table 
          tabIndex={-1}
          ref={excel_mode ? null : "table"}
          id="main-table"
          className="border infobase-table table-rpb table-dark-blue table-rpb-simple"
        >
          <thead>
            <tr className="table-header">
              <th 
                scope="col"
                style={{ cursor: 'pointer' }}
                key="dept"
              > 
                <PlainTableHeader
                  disabled={excel_mode}
                  display={text_maker('org')} 
                  active={sort_col === 'dept' ? sortDirection : null }
                  onClick={()=> on_header_click('dept') }
                />
              </th>
              {[ 
                ...non_dept_key_cols, 
                ...data_columns,
              ].map( ({nick, fully_qualified_name}) => 
                <th 
                  scope="col"
                  style={{ cursor: 'pointer' }}
                  key={nick}
                >
                  <PlainTableHeader
                    disabled={excel_mode}
                    display={fully_qualified_name} 
                    active={sort_col === nick ? sortDirection : null }
                    onClick={()=> on_header_click(nick) }
                  />
                </th> 
              )}
            </tr>
          </thead>
          <tbody>
            {_.map( (excel_mode? flat_data : shown_rows), row => 
              <tr key={row.csv_index}>
                <td 
                  key={'dept'}
                  className="key-col-cell"
                > 
                  {Dept.lookup(row.dept).name} 
                </td>
                { _.map(
                  non_dept_key_cols, ({nick}) => 
                    <td 
                      key={nick}
                      className="key-col-cell"
                    > 
                      { row[nick] } 
                    </td> 
                ).concat(
                  _.map(data_columns, ({nick, type}) => 
                    <td 
                      className="data-col-cell"
                      key={nick}
                    > 
                      { !excel_mode ?
                <Format
                  type={type}
                  content={row[nick]}
                /> :
                row[nick] 
                      }
                    </td> 
                  )
                )}
              </tr>
            )}
            <tr key="_rpb_total">
              <td key='dept'> 
                { 
            pages.length > 1 ? 
            text_maker('total_all_pages') :
            text_maker('total')
                } 
              </td>
              { _.map(non_dept_key_cols, ({nick}) => 
                <td 
                  className="key-col-cell" 
                  key={nick}
                /> 
              )}
              { _.map(data_columns, ({nick, type}) => 
                <td 
                  className="data-col-cell"
                  key={nick}
                > 
                  { !excel_mode ?
            <Format 
              type={type} 
              content={totals_by_nick[nick]} 
            /> :
            totals_by_nick[nick]
                  }
                </td>
              )}
            </tr>
          </tbody>
        </table>

        {!excel_mode && pages.length > 1 && 
          <div className="pagination-container">
            {window.is_a11y_mode && 
              <p>
                <TextMaker text_key="pagination_a11y" args={{current: page_num, total: pages.length }} />
              </p>
            }
            <ul className="pagination">
              {_.map(pages, (data,ix)=> 
                <li 
                  key={ix}
                  className={classNames(ix===page_num && 'active')}
                >
                  <span
                    tabIndex={0}
                    style={ix===page_num ? {color: '#fcfcfc'} : null }
                    disabled={page_num === ix}
                    role="button" 
                    onClick={ 
                      ix === page_num ?
                        null : 
                        ()=> {
                          on_set_page(ix);
                          this.refs.table.focus();
                        }
                    }
                    onKeyDown={
                      ix === page_num ?
                        null : 
                        (e)=> {
                          if (e.keyCode===13 || e.keyCode===32){
                            on_set_page(ix);
                            this.refs.table.focus();
                          }
                        }
                    }
                  >
                    {ix+ 1}
                  </span>
                </li>
              )}
            </ul> 
          </div>
        }
      </div>
    )

  }

  get_csv_string(){
    const { 
      flat_data,
      sorted_key_columns,
      columns,
    } = this.props;

    const non_dept_key_columns = _.reject(sorted_key_columns, {nick: 'dept'});


    const cols = [
      'dept',
      ...non_dept_key_columns,
      ...columns,
    ];


    const headers = [
      text_maker('org'),
      ..._.map([ 
        ...non_dept_key_columns, 
        ...columns,
      ], 'fully_qualified_name'),
    ];
      

    const array_based_rows = _.chain(flat_data)
      .map( row => _.map(
        cols,
        col => (
          col === "dept" ?
          Dept.lookup(row.dept).name :
          row[col.nick]
        )
      ))
      .value();

    const headers_and_rows = [headers].concat(array_based_rows);
    return d3.csvFormatRows(headers_and_rows);
  }


}

class PlainTableHeader extends React.PureComponent {
  render(){
    const { 
      display, 
      active, 
      onClick, 
      disabled, 
    } = this.props;
  
    return <div onClick={onClick}>
      {display}
      {!disabled && 
        <span aria-hidden={true}>
          <SortIndicators 
            asc={active ==="ASC" }
            desc={active ==="DESC" }
          />
        </span>
      }
    </div>;
  }
}

class ExportButton extends React.Component {
  //note that though props may not have changed, this method doesn't get trigerred from this.setState 
  constructor(){
    super();
    this.state = { 
      success: null,
    }; 
  }
  static getDerivedStateFromProps(nextProps, prevState){
    return { 
      success: null,
    };
  }
  render(){
    const {
      id,
    } = this.props;
    const { 
      success,
    } = this.state


    if( window.feature_detection.download_attr ){
      return <div>
        <button 
          id={id}
          className="btn btn-ib-primary btn-block"
          onClick={ ()=> { this.triggerDownload() } }
        >
          <TextMaker text_key="export_table" />
        </button>
      </div>
    } else if(window.feature_detection.clipboard_access){
      const buttonText = (
        success === false ? 
        <TextMaker text_key="error" /> :
        ( 
          success === true ?
          <TextMaker text_key="finished_export_table_to_clipboard" /> :
          <TextMaker text_key="export_table_to_clipboard" />
        )
      );
      
      return <div>
        <button 
          id={id}
          className="btn btn-ib-primary btn-block"
          onClick={ ()=>{ this.clipBoardClickHandler() } }
        >
          { buttonText }
        </button>
      </div>;

    } else {
      return null;
    }

  }
  triggerDownload(){
    const csv_str = this.props.get_csv_string();
    const uri = "data:text/csv;charset=UTF-8," + encodeURIComponent(csv_str);
    
    const temporary_anchor = document.createElement('a');
    temporary_anchor.setAttribute("download", 'table.csv');
    temporary_anchor.setAttribute("href", uri);
    temporary_anchor.dispatchEvent( new MouseEvent('click') );
  }
   

  clipBoardClickHandler(){
    const {
      get_excel_string,
    } = this.props;


    try {

      window.clipboardData.setData('Text', get_excel_string());
      this.setState({success: true});

    } catch(e){
      this.setState({success: false});
    }

    setTimeout(()=>{
      this.setState({success: null});
    },3000)

  }
}


export {
  GranularView,
};
