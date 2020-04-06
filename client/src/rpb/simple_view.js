import { TextMaker, text_maker } from './rpb_text_provider.js';
import { 
  ReportDetails,
  ReportDatasets,
  ShareReport,
  NoDataMessage,
  ExportButton,
} from './shared.js';
import { 
  Select, 
  Format, 
  LabeledBox,
  AlertBanner,
  CheckBox,
  DisplayTable,
} from '../components/index.js';
import { GraphLegend } from '../charts/declarative_charts.js';
import { Details } from '../components/Details.js';
import { rpb_link } from './rpb_link.js';
import { Subject } from '../models/subject.js';

const { Gov, Dept } = Subject;

//note: don't use these outside the context of simple view, and always pass all props in currentProps
const granular_rpb_link_for_org = (currentProps, subject)=> rpb_link( { ...currentProps, subject, mode: 'details' } );
const granular_rpb_link_for_filter = (currentProps, filter) => rpb_link({ ...currentProps, filter, mode: 'details' } );


class SimpleView extends React.Component {

  render() {
    const {
      subject,
      table,
      dimension,
      filter,
      columns,

      flat_data,
      all_data_columns,
      deptBreakoutMode,
      dimensions, 
      filters,
      
      on_set_dimension,
      on_set_filter,
      on_toggle_col_nick,
      on_toggle_deptBreakout,
    } = this.props;

    return (
      <div> 
        <LabeledBox label={<TextMaker text_key="rpb_table_controls" />}>
          <div className="rpb-config rpb-simple row">
            <div className="col-md-6">
              <fieldset className="rpb-config-item col-selection simple">
                <legend className="rpb-config-header"> <TextMaker text_key="select_columns" /> </legend>
                <GraphLegend 
                  items={
                    _.map(all_data_columns, obj => ({
                      id: obj.nick,
                      label: obj.fully_qualified_name,
                      active: _.includes(_.map(columns, 'nick'), obj.nick),
                    }))
                  }
                  onClick={ id=> on_toggle_col_nick(id) }
                />
              </fieldset>
            </div>
            <div className="col-md-6">
              { subject === Gov && 
                <div className="rpb-config-item">
                  <CheckBox
                    disabled={subject!==Gov}
                    active={deptBreakoutMode}
                    onClick={on_toggle_deptBreakout}
                    label={text_maker("show_dept_breakout")}
                  />
                </div>
              }
              <div className="rpb-config-item">
                <div className="row">
                  <div className="col-md-2" style={{paddingLeft: "0px"}}>
                    <label className="rpb-config-header" htmlFor="dim-select"> 
                      <span className="nowrap">
                        <TextMaker text_key="group_by" />
                      </span>
                    </label>
                  </div>
                  <div className="col-md-10">
                    <Select
                      id="dim_select"
                      className="form-control form-control-ib rpb-simple-select"
                      options={dimensions}
                      selected={dimension}
                      onSelect={id => on_set_dimension(id)}
                    />
                  </div>
                  <div className="clearfix" />
                </div>
              </div>
              { deptBreakoutMode &&
                <div className="rpb-config-item">
                  <div className="row">
                    <div className="col-md-2" style={{paddingLeft: "0px"}}>
                      <label className="rpb-config-header" htmlFor="filt-select"> <TextMaker text_key="filter" /> </label>
                    </div>
                    <div className="col-md-10">
                      <Select
                        id="filt_select"
                        className="form-control form-control-ib rpb-simple-select"
                        options={filters.sort().map( filter => ({ id: filter, display: filter }) )}
                        selected={filter}
                        onSelect={id => on_set_filter({
                          dimension: dimension, 
                          filter: id,
                        })}
                      />
                    </div>
                    <div className="clearfix" />
                  </div>
                </div>
              }
              <div className="rpb-config-item">
                <ExportButton
                  id="export_button"
                  get_csv_string={ ()=> this.get_csv_string() }
                />
              </div>
              <ShareReport/>
            </div>
            <div className="clearfix" />
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
        <LabeledBox label={<TextMaker text_key="rpb_report_data_sources" args={{table_name: table.name}} />}>
          <ReportDatasets {...this.props} /> 
        </LabeledBox>
        { table.rpb_banner && <AlertBanner>{table.rpb_banner}</AlertBanner> }
        <div id="rpb-main-content" >
          { 
            _.isEmpty(flat_data) ? 
            <NoDataMessage />
            : ( 
              this.get_table_content()
            )
          }
        </div>
      </div>
    );
  }

  get_csv_string(){
    const {
      dimension,
      columns,
      deptBreakoutMode,
      simple_table_rows: {
        rows,
        total_row,
      },
    } = this.props;

    const headers = [
      text_maker(deptBreakoutMode ? 'org' : dimension),
      ..._.map( columns, (col) => (col.fully_qualified_name ) ),
    ];
    const formatted_rows = 
      _.chain(rows)
        .map((row) =>{
          return _.concat(
            deptBreakoutMode ? Dept.lookup(row.dept).name : row[dimension],
            _.map( columns, ({nick}) => row[nick])
          );
        })
        .value();
    const formatted_total_row = _.concat( text_maker("total"), _.map(columns, ({nick}) => total_row[nick]) );
    const formatted_table_content = [headers].concat(formatted_rows, [formatted_total_row]);
    return d3.csvFormatRows(formatted_table_content);
  }

  get_table_content(){
    const {
      dimension,   
      columns,
      deptBreakoutMode,
      simple_table_rows: { rows },
    } = this.props;

    const first_col_nick = deptBreakoutMode ? 'dept' : dimension;
    const column_names = 
      {
        [deptBreakoutMode ? 'dept' : dimension]: text_maker(deptBreakoutMode ? 'org' : dimension),
        ..._.chain( columns)
          .map( col => [ col.nick, col.fully_qualified_name ] )
          .fromPairs()
          .value(),
      };
    const dp_rows = _.chain(rows)
      .map(row => {
        const row_values = _.chain(columns)
          .map( col => [col.nick, row[col.nick]])
          .fromPairs()
          .value();
        const display_values = {
          [first_col_nick]: first_col_nick === "dept" ? 
          <a href={granular_rpb_link_for_org(this.props, Dept.lookup(row.dept))}>
            {Dept.lookup(row.dept).name}
          </a> :
          <a href={granular_rpb_link_for_filter(this.props, row[first_col_nick])}>
            {row[first_col_nick]}
          </a>,
          ..._.chain(columns)
            .map( col => [col.nick, <Format key={col.nick} type={col.type} content={row[col.nick]}/>])
            .fromPairs()
            .value(),
        };
        const sort_values = {
          [first_col_nick]: first_col_nick === "dept" ? Dept.lookup(row.dept).name : row[first_col_nick],
          ...row_values,
        };
        const search_values = {
          [first_col_nick]: first_col_nick === "dept" ? Dept.lookup(row.dept).name : row[first_col_nick],
        };
        return {
          display_values: display_values,
          sort_values: sort_values,
          search_values: search_values,
        };
      })
      .value();

    return <DisplayTable
      name="simple_table"
      rows={dp_rows}
      column_names={column_names}
      ordered_column_keys={_.keys(column_names)}
      total={ _.chain(columns)
        .map( ({nick, type}) => [nick, type] )
        .fromPairs()
        .value()
      }
    />;
  }
}


export {
  SimpleView,
}; 