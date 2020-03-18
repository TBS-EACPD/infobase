import { TextMaker, text_maker } from './rpb_text_provider.js';
import { 
  ReportDetails,
  ReportDatasets,
  ExportButton,
  ShareReport,
  NoDataMessage,
} from './shared.js';
import { 
  Format, 
  TwoLevelSelect, 
  SortDirections, 
  LabeledBox,
  AlertBanner,
} from '../components/index.js';
import { GraphLegend } from '../charts/declarative_charts.js';
import { Details } from '../components/Details.js';
import { Subject } from '../models/subject.js';

import classNames from 'classnames';

const { Dept } = Subject;
const PAGE_SIZE = 600;

class GranularView extends React.Component {
  render(){
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
        <LabeledBox label={<TextMaker text_key="rpb_table_controls" />}>
          <div className="row">
            <div className='col-md-6'>
              <fieldset className="rpb-config-item col-selection simple">
                <legend className="rpb-config-header"> <TextMaker text_key="select_columns" /> </legend>
                <GraphLegend 
                  items={
                    _.map(all_data_columns, ({nick, fully_qualified_name}) => ({
                      id: nick,
                      label: fully_qualified_name,
                      active: _.includes(_.map(columns,'nick'), nick),
                    }))
                  }
                  onClick={ id=> on_toggle_col_nick(id) }
                />
              </fieldset>
            </div>
            <div className="col-md-6">
              <div className="rpb-config-item">
                <label className='rpb-config-header' htmlFor='filt_select'> Filter </label>
                <TwoLevelSelect
                  className="form-control form-control-ib"
                  id="filt_select"
                  onSelect={ id=> {
                    const [ dim_key, filt_key ] = id.split('__');
                    on_set_filter({filter: filt_key, dimension: dim_key});
                  }}
                  selected={dimension+'__'+filter}
                  grouped_options={ 
                    _.mapValues(filters_by_dimension, 
                      filter_by_dim => (
                        {
                          ...filter_by_dim, 
                          children: _.sortBy(filter_by_dim.children, "display"),
                        }
                      ) 
                    )
                  }
                />
              </div>
              <div className="rpb-config-item">
                <ExportButton 
                  id="export_button"
                  get_csv_string={ () => this.get_csv_string() }
                />
              </div>
              <ShareReport />
            </div>
            <div className='clearfix'/>
          </div>
        </LabeledBox>
        <LabeledBox label={<TextMaker text_key="rpb_report_details" args={{table_name: table.name}} />}>
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
        </LabeledBox>
        <LabeledBox label={<TextMaker text_key="rpb_report_data_sources" />}>
          <ReportDatasets {...this.props} /> 
        </LabeledBox>
        { table.rpb_banner && <AlertBanner>{table.rpb_banner}</AlertBanner> }
        <div id="rpb-main-content" >
          { 
          _.isEmpty(flat_data) ? 
          <NoDataMessage /> :
          this.get_plain_table_content()
          }
        </div>
      </div>
    );


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
                    style={ix===page_num ? {color: window.infobase_color_constants.textLightColor} : null }
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
    );

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
          <SortDirections 
            asc={active ==="ASC" }
            desc={active ==="DESC" }
          />
        </span>
      }
    </div>;
  }
}

export {
  GranularView,
};
