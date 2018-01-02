const {
  Dept, 
  get_by_guid,
} = require("../models/subject");
const {Table} = require('../core/TableClass');
const {
  text_maker, 
} = require('../models/text');
const {
  TextMaker,
  Format,
  Select,
  TwoLevelSelect,
} = require('../util_components.js');
const { 
  get_dimension_title_keys,
  data_columns, 
  key_columns,
  get_filters,
  SelectList,
  get_full_table_data,
  subject_filter_func,
  cat_filter_func,
  zero_filter_func,
  reverse_array,
  SortIndicators,
  ReportDetails,
  ReportDatasets,
  NoDataMessage,
  AlertMessage,
} = require('./shared.js');

const classNames = require('classnames');


const PAGE_SIZE = 600;

class RowLevelView extends React.Component {
  get_active_col_nicks(){
    return _.chain(this.props.columns)
      .filter(_.property('selected'))
      .map(obj => obj.col.nick )
      .value();
  }
  render() {
    const {
      table,
      dimension,
      filter,
      subject,
      columns,
      sorting_column,
      descending,

      setDimension,
      setFilter,
      setSort,
    } = this.props;

    const key_col_objs = key_columns(table);
    const data_col_objs = data_columns(table);

    const data = this.get_data();

    return (
      <div>
        <div className="rpb-option">
          <div className='rpb-option-label '>
            <div className='rpb-option-label-text '>
              <TextMaker text_key="blue_text_table_controls" />
            </div>
          </div>
          <div className="rpb-option-content">
            <div className="row">
              <div className='col-md-6'>
                <div className="rpb-config-item col-selection granular">
                  <label className="rpb-config-header" > <TextMaker text_key="select_columns" /> </label>
                  <SelectList 
                    items={ _.map(data_col_objs, obj => ({
                      id: obj.nick, 
                      display: obj.fully_qualified_name }) 
                    )}
                    selected={ columns }
                    is_multi_select={true}
                    onSelect={id=> this.props.toggleColNick(id) }
                  />
                </div>
              </div>
              <div className='col-md-4 sr-only'>
                <label className="rpb-config-header" > <TextMaker text_key="sort_by" /> 
                  <Select 
                    className="form-control"
                    options={ 
                      _.chain(key_col_objs.concat(data_col_objs))
                        .filter( col_obj => _.includes(this.props.columns, col_obj.nick) || col_obj.key  )
                        .map( obj => ({id: obj.nick, display: obj.fully_qualified_name }) )
                        .value()
                    }
                    selected={ sorting_column }
                    onSelect={id=> setSort({
                      sorting_column: id,
                      descending,
                    })}
                  />
                </label>
                <label 
                  className="rpb-config-header mrgn-tp-md" 
                  htmlFor='desc_or_asc' 
                > 
                    Sort Descending
                  <input 
                    id='desc_or_asc'
                    type="checkbox"
                    checked={descending}
                    onChange={()=>{ 
                      setSort({
                        descending : !descending,
                        sorting_column,
                      });
                    }}
                    style={{ marginLeft: '15px' }}
                  />
                </label>
              </div>
              <div className="col-md-6">
                <label className='rpb-config-header' htmlFor='filt_select'> Filter </label>
                <TwoLevelSelect
                  className="form-control"
                  id="filt_select"
                  onSelect={ id=> {
                    const [ dim_key, filt_key ] = id.split('__');
                    setDimension(dim_key);
                    setFilter(filt_key);
                  }}
                  selected={dimension+'__'+filter}
                  grouped_options={_.map(
                    get_dimension_title_keys(table),
                    dim_key => ({
                      display: text_maker(dim_key),
                      id:dim_key,
                      children: _.map(
                        [ 
                          text_maker('all'), 
                          ...get_filters(table, dim_key, this.get_active_col_nicks()),
                        ], filt => ({
                          id: dim_key+'__'+filt,
                          display: filt,
                        })
                      ),
                    }) 
                  )}
                />
                <div className="mrgn-tp-lg">
                  <ExportButton 
                    id="export_button"
                    get_csv_string={ ()=> this.get_csv_string(data) }
                    get_excel_string={ ()=> {
                      const el = document.createElement('div');
                      ReactDOM.render(this.get_plain_table_content({format: false, data}), el)
                      const excel_str= el.innerHTML;
                      ReactDOM.unmountComponentAtNode(el);
                      return excel_str;
                    }}
                  />
                </div>
              </div>
              <div className='clearfix'/>
            </div>
          </div>
        </div>
        <div className="rpb-option">
          <div className='rpb-option-label '>
            <div className='rpb-option-label-text '>
              <TextMaker text_key="blue_text_report_details" args={{table_name:Table.lookup(table).name}} />
            </div>
          </div>
          <div className="rpb-option-content">
            <details>
              <summary> { Table.lookup(table).title } : {get_by_guid(subject).name}  </summary>
              <ReportDetails {...this.props} />
            </details>
          </div>
        </div>
        <div className="rpb-option">
          <div className='rpb-option-label '>
            <div className='rpb-option-label-text '>
              <TextMaker text_key="blue_text_report_data_sources"/>
            </div>
          </div>
          <div className="rpb-option-content">
            <ReportDatasets {...this.props} />
          </div>
        </div>
        <div id="rpb-main-content" >
          <AlertMessage table={table} />
          { 
              _.isEmpty(data) ? 
              <NoDataMessage /> :
              this.get_plain_table_content({format:true, data})
          }
        </div>
      </div>
    );
  } 
  get_csv_string(data){
    //exports a filtered version of table full data
    // columns 
    //recall that d3.csv.formatRows will take in an array of *array* based rows
    //since arrays have no properties likes objects, you must append the headers as the first row
    const { 
      columns, 
    } = this.props;

    const table_obj = Table.lookup(this.props.table)
    const key_col_nicks = _.chain(table_obj.flat_headers)
      .filter(col => (col.key && !col.hidden) || col.nick === 'dept')
      .map(_.property('nick'))
      .value();

    const all_col_nicks = key_col_nicks.concat(columns);

    const all_col_objs= _.map( 
      all_col_nicks, 
      nick => table_obj.col_from_nick(nick) 
    );

    const col_headers = _.map(all_col_objs, 'fully_qualified_name')

    const array_based_rows = _.chain(data)
      .map( row => _.map(
        all_col_objs,
        ({nick, type }) => (
          nick === "dept" ?
            Dept.lookup(row[nick]).name :
            (row[nick]) 
        )
      ))
      .value();

    const headers_and_rows = [col_headers].concat(array_based_rows);
    
    return d4.csvFormatRows(headers_and_rows);
  }
  get_data(){
    const {
      table,
      subject,
      filter,
      dimension,
      descending,
      sorting_column,
      columns,
    } = this.props;

    

    const subject_filter = subject_filter_func(table, subject)
    
    //category filter is based on dimension and 'filter'
    const cat_filter = cat_filter_func(dimension, filter);

    const zero_filter = zero_filter_func(columns); 

    return _.chain(get_full_table_data(table))
      .filter(subject_filter)
      .filter(cat_filter)
      .reject(zero_filter)
      .sortBy( 
        sorting_column === 'dept' ? 
        row => Dept.lookup(row.dept).name : 
        sorting_column
      )
      .pipe( 
        descending ? 
        reverse_array :  
        _.identity 
      )
      .value()
  }
  get_plain_table_content({format,data}){
    const {
      table,
      columns,
      sorting_column,
      descending,
      setSort,
      setPage,
    } = this.props;

    const page_num = this.props.page_num || 0;
    const pages = _.chunk(data, PAGE_SIZE);
    const shown_rows = pages[page_num];

    const sortDirection = descending ? "DESC" : "ASC";

    const table_obj = Table.lookup(table);

    const sorted_col_objs  = _.chain(table_obj.unique_headers)
      .filter( nick => _.includes(columns,nick) )
      .map(nick => table_obj.col_from_nick(nick))
      .value();


    const sorted_non_dept_key_col_objs = _.filter(
      table_obj.flat_headers,
      col => col.key && !col.hidden && col.nick !== 'dept'
    );


    const totals_by_nick = _.chain(sorted_col_objs)
      .map( obj => [ obj.nick, obj.formula(data) ] )
      .fromPairs()
      .value();

    return (
      <div>
        <table 
          tabIndex={-1}
          ref="table"
          id="main-table"
          className="border infobase-table table-rpb table-dark-blue table-rpb-simple "
        >
          <thead>
            <tr className="table-header">
              <th 
                scope="column"
                style={{ cursor: 'pointer' }}
                key="dept"
              > 
                <PlainTableHeader
                  disabled={!format}
                  display={text_maker('org')} 
                  active={sorting_column === 'dept' ? sortDirection : null }
                  onClick={()=>{ 
                    setSort({ 
                      descending: (
                    sorting_column === 'dept' ?
                    !descending :
                    true
                      ),
                      sorting_column: 'dept',      
                    });
                  }}
                />
              </th>
              {[ 
                ...sorted_non_dept_key_col_objs, 
                ...sorted_col_objs,
              ].map(col => 
                <th 
                  scope="column"
                  style={{ cursor: 'pointer' }}
                  key={col.nick}
                >
                  <PlainTableHeader
                    disabled={!format}
                    display={col.fully_qualified_name} 
                    active={sorting_column === col.nick ? sortDirection : null }
                    onClick={()=>{ 
                      setSort({ 
                        descending: (
                      sorting_column === col.nick ?
                      !descending :
                      true
                        ),
                        sorting_column: col.nick,      
                      });
                    }}
                  />
                </th> 
              )}
            </tr>
          </thead>
          <tbody>
            {_.map(shown_rows, row => 
              <tr key={row.csv_index}>
                <td 
                  key={'dept'}
                  className="key-col-cell"
                > 
                  {Dept.lookup(row.dept).name} 
                </td>
                { _.map(
                  sorted_non_dept_key_col_objs, col => 
                    <td 
                      key={col.nick}
                      className="key-col-cell"
                    > 
                      { row[col.nick] } 
                    </td> 
                ).concat(
                  _.map(sorted_col_objs, col => 
                    <td 
                      className="data-col-cell"
                      key={col.nick}
                    > 
                      { format ?
                <Format
                  type={col.type}
                  content={row[col.nick]}
                /> :
                row[col.nick] 
                      } 
                    </td> 
                  )
                )}
              </tr>
            )}
            <tr key="_rpb_total">
              <td key='dept'> 
                { 
            pages.length === 1 ? 
            text_maker('total') :
            text_maker('total_all_pages') 
                } 
              </td>
              { _.map(sorted_non_dept_key_col_objs, col => 
                <td 
                  className="key-col-cell" 
                  key={col.nick}
                /> 
              )}
              { _.map(sorted_col_objs, col => 
                <td 
                  className="data-col-cell"
                  key={col.nick}
                > 
                  { format ?
            <Format 
              type={col.type} 
              content={totals_by_nick[col.nick]} 
            /> :
            totals_by_nick[col.nick]
                  }
                </td>
              )}
            </tr>
          </tbody>
        </table>
        {pages.length > 1 && 
      <div className="pagination-container">
        <p className="sr-only">
          <TextMaker text_key="pagination_a11y" args={{current: page_num, total: pages.length }} />
        </p>
        <ul className="pagination">
          {_.map(pages, (data,ix)=> 
            <li 
              key={ix}
              className={classNames(ix===page_num && 'active')}
            >
              <a 
                href="#" 
                style={ix===page_num ? {color:'#fcfcfc'} : null }
                disabled={page_num === ix}
                role="button" 
                onClick={ 
                  ix === page_num ?
                  null : 
                  ()=> {
                    setPage(ix);
                    this.refs.table.focus();
                  }
                }
              >
                {ix+ 1}
              </a>
            </li>
          )}
        </ul> 
      </div>
        }
      </div>
    )

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

/*

  this is  a somewhat statefull component
  when the user clicks the export button, and it suceeds, the button will display that it has suceeded.

  a couple seconds later


*/
class ExportButton extends React.Component {
  //note that though props may not have changed, this method doesn't get trigerred from this.setState 
  constructor(){
    super();
    this.state = { 
      success : null,
    }; 
  }
  componentWillReceiveProps(){
    this.setState({ 
      success : null,
    });
  }
  render(){
    const {
      id,
    } = this.props;
    const { 
      success,
    } = this.state


    if( window.download_attr ){
      return <div>
        <button 
          id={id}
          className="btn btn-ib-primary btn-block"
          onClick={ ()=> { this.triggerDownload() } }
        >
          <TextMaker text_key="export_table" />
        </button>
      </div>
    } else if(window.clipboard_access){
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
    const csv_str =  this.props.get_csv_string();
    const uri = "data:text/csv;charset=UTF-8," + encodeURIComponent(csv_str);
    $('<a/>').attr("download", 'table.csv').attr("href", uri)[0].dispatchEvent(new MouseEvent('click'));
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
      this.setState({success:null});
    },3000)

  }
}

module.exports = { 
  RowLevelView,
}
