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
  LabeledBox,
  AlertBanner,
  DisplayTable,
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
      columns: data_columns,
      page_num,
      flat_data,
      sorted_key_columns,

      on_set_page,
    } = this.props;

    const pages = _.chunk(flat_data, PAGE_SIZE);
    const shown_rows = pages[page_num];

    const non_dept_key_cols = _.reject(sorted_key_columns, {nick: 'dept'});

    const cols = [
      ...non_dept_key_cols,
      ...data_columns,
    ];
    const column_names = _.chain([
      {nick: "dept", fully_qualified_name: text_maker("org")},
      ...cols,
    ])
      .map( ({nick, fully_qualified_name}) => [nick, fully_qualified_name] )
      .fromPairs()
      .value();
    
    const table_data = _.map(shown_rows, row => ({
      dept: {value: Dept.lookup(row.dept).name},
      ..._.chain(cols)
        .map( ({nick}) => [ nick, {value: row[nick]} ] )
        .fromPairs()
        .value(),
    }));
    const column_config = {
      display: {
        dept: ({value}) => <Format type={'wide-str'} content={value} />,
        ..._.chain(cols)
          .map( ({nick, type}) => [ nick, ({value}) => type ? <Format type={type} content={value}/> : value ] )
          .fromPairs()
          .value(),
      },
      sort: _.chain(cols)
        .map( ({nick}) => nick)
        .concat(["dept"])
        .value(),
      search: _.chain(non_dept_key_cols)
        .map( ({nick}) => nick)
        .concat(["dept"])
        .value(),
      total: _.chain(data_columns)
        .map( ({nick, type}) => [nick, type])
        .fromPairs()
        .value(),
    };

    return (
      <div>
        <DisplayTable
          data={table_data}
          column_names={column_names}
          column_config={column_config}
          ordered_column_keys={_.keys(column_names)}
        />

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

export {
  GranularView,
};
