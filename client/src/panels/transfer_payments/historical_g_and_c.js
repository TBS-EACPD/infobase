import {Fragment } from 'react';
import {
  text_maker,
  TM,
} from './gnc_text_provider.js';
import {
  run_template,
  PanelGraph,
  years,
  businessConstants,
  declarative_charts,
  Panel,
  util_components,
  NivoResponsiveLine,
  infobaseCategory10Colors,
} from "../shared.js";

const { transfer_payments } = businessConstants;
const { std_years } = years;
const { Format } = util_components;

const { 
  GraphLegend,
  A11YTable,
} = declarative_charts;

const exp_years = std_years.map(year=> year+'exp');

const text_years = _.map(std_years, run_template);

new PanelGraph({
  level: "gov",
  key: "historical_g_and_c",
  info_deps: [
    'orgTransferPayments_gov_info',
  ],

  depends_on: ['orgTransferPayments'],
  calculate(subject){
    const {orgTransferPayments} = this.tables;
    return orgTransferPayments.payment_type_ids(exp_years, false);
  },
  render({calculations, footnotes, sources}){
    const { 
      info,
      graph_args: series,
    } = calculations;
    return (
      <Panel
        title={text_maker("historical_g_and_c_title")}
        {...{footnotes, sources}}
      >
        <HistTPTypes
          text={
            <TM k="gov_historical_g_and_c_text" args={info} />
          }
          text_split={4}
          series={series}
        />
      </Panel>
    );
  },
});

new PanelGraph({
  level: "dept",
  depends_on: ['orgTransferPayments'],

  info_deps: [
    'orgTransferPayments_gov_info',
    'orgTransferPayments_dept_info',
  ],

  key: "historical_g_and_c",
  footnotes: ['SOBJ10'],
  calculate(dept){
    const {orgTransferPayments} = this.tables;

    return {
      rolled_up: orgTransferPayments.payment_type_ids(exp_years,dept.unique_id),
      rows: _.chain(orgTransferPayments.q(dept).data)
        .sortBy("{{pa_last_year}}exp")
        .reverse()
        .value(),
    };
  },
  render({calculations,footnotes, sources}){
    const { 
      info, 
      graph_args: {
        rows,
        rolled_up,
      } } = calculations;
    const text_content= <TM k="dept_historical_g_and_c_text" args={info} />; 

    return (
      <Panel
        title={text_maker("historical_g_and_c_title")}
        {...{sources, footnotes}}
      >
        <HistTPTypes
          text={text_content}
          text_split={6}
          series={rolled_up}
        />
        <div className="results-separator" />
        <DetailedHistTPItems
          rows={rows}
        />
      </Panel>
    );
  },
});


//gov: this is the content of the entire panel
//dept: this is the top part of the panel
const tp_type_name = type_id => transfer_payments[type_id].text;
class HistTPTypes extends React.Component {
  constructor(){
    super();
    this.state = {
      active_types: ['o','c','g'],
    };
  }
  render(){
    const {
      text,
      series,
      text_split,
    } = this.props;

    const { active_types } = this.state;
    const filtered_series = _.chain(series)
      .pick(active_types)
      .mapKeys( (val,key) => tp_type_name(key) )
      //HACKY: make sure the object's key are sorted 
      //sorting an object doesn't really exist, but it works and it's the
      // only way to get the Line chart to display in the right order...
      .toPairs()
      .sortBy( ([_k, vals]) => _.sum(vals) )
      .reverse()
      .fromPairs()
      .value();


    const colors = infobase_colors();

    const legend_items = _.chain(series)
      .toPairs()
      .sortBy( ([_k, vals]) => _.sum(vals))
      .reverse()
      .map( ([key]) => {
        const type_name = tp_type_name(key);
        return {
          id: key,
          label: type_name,
          active: !!filtered_series[type_name],
          color: colors(type_name),
        };
      })
      .value();

    let content; 
    if(window.is_a11y_mode){
      const a11y_data = _.chain(filtered_series)
        .toPairs()
        .map( ([label, data]) => ({ 
          label, 
          data: _.map(data, num => <Format type="compact1_written" content={num} /> ),
        }) )
        .value()


      content = <A11YTable
        data_col_headers={text_years}
        data={a11y_data}
        label_col_header={text_maker("transfer_payment_type")}
      />;
    } else {

      const expenditure_data = _.map(
        filtered_series, 
        (expenditure_array, expenditure_label) => ({
          id: expenditure_label,
          data: expenditure_array.map(
            (expenditure_value, year_index) => ({
              x: text_years[year_index],
              y: expenditure_value,
            })
          ),
        })
      );

      content = <Fragment>
        <div className="legend-container">
          <GraphLegend
            items={legend_items}
            isHorizontal
            onClick={ id => 
              !(
                !!filtered_series[tp_type_name(id)] && 
                _.size(filtered_series) === 1
              ) && this.setState({active_types: _.toggle_list(active_types, id) })
            }
          />  
        </div>

        <div style ={{height: '400px'}} aria-hidden = {true}>
          <NivoResponsiveLine
            enableArea = {true}
            data = {expenditure_data}
            colorBy={d => colors(d.id)}
            stacked = {true}
          />
        </div>
      </Fragment>
    }
    return <div className="frow middle-xs">
      <div className={`fcol-md-${text_split}`}>
        <div className="medium_panel_text">
          {text}
        </div>
      </div>
      <div className={`fcol-md-${12-text_split}`}>
        {content}
      </div>
    </div>;
  }
}

class DetailedHistTPItems extends React.Component {
  constructor(props){
    super(props);
    const { rows } = props;
    this.state = {
      active_indices: [0],
      active_type: _.first(rows, "type_id").type_id,
    };
    
    this.color_scale = infobase_colors();

  }
  render(){
    const { rows } = this.props;
    const { active_indices, active_type } = this.state;
    const { color_scale } = this;

    const prepped_rows = _.chain(rows)
      .filter({ type_id: active_type })
      .sortBy(row => row["{{pa_last_year}}exp"])
      .reverse()
      .value();

    
    const graph_series = _.chain(prepped_rows)
      .map(row => [
        row.tp,
        _.map(exp_years, yr=> row[yr]),
      ])
      .filter( (_val, ix)=> _.includes(active_indices, ix))
      .fromPairs()
      .value();

    
    const legend_items = _.map(prepped_rows, (row,ix) => ({
      id: ix,
      label: row.tp,
      color: color_scale(row.tp),
      active: _.includes(active_indices, ix),
    }));

    const detail_expend_data = _.map(
      graph_series, 
      (expend_array, expend_label) => ({
        id: expend_label,
        data: expend_array.map(
          (expend_value, year_index) => ({
            y: expend_value,
            x: text_years[year_index],
          })
        ),
      })
    );

    const title_el = <header className="h3">
      <TM k="historical_g_and_c_detailed_title" />
    </header>;

    if(window.is_a11y_mode){
      let a11y_data = _.map(prepped_rows, record => {
        const { tp } = record;
        return {
          label: tp,
          data: _.map(std_years, yr => 
            <Format
              type="compact1"
              content={record[`${yr}exp`] || 0}
            />
          ),
        }
      });
      return <div>
        {title_el}
        <A11YTable 
          data={a11y_data}
          label_col_header={text_maker("transfer_payment")}
          data_col_headers={text_years}
        />
      </div>
    }

    return <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {title_el}
        <select
          style={{margin: "2rem 0"}}
          className="form-control"
          onChange={evt => {
            //reset colour scale for new items
            this.color_scale = infobase_colors();
            this.setState({
              active_type: evt.target.value,
              active_indices: [0],
            });
          }}
        >
          {_.map(["c","o","g"], type_id =>
            _.find(rows, {type_id}) && 
            <option
              value={type_id}
              key={type_id}
            >
              {tp_type_name(type_id)}
            </option> 
          )}
        </select>
      </div>
      <div className="frow">
        <div className="fcol-md-4">
          <div 
            className="legend-container"
            style={{
              maxHeight: 400,
            }}
          >
            <GraphLegend
              onClick={ id => !(active_indices.length==1 && active_indices.includes(id))
              && this.setState({active_indices: _.toggle_list(active_indices,id)})}
              items={legend_items}
            />  
          </div>
        </div>
        <div className="fcol-md-8" style={{height: '400px'}} aria-hidden = {true}>
          <NivoResponsiveLine
            data = {detail_expend_data}
            margin = {{
              "top": 50,
              "right": 30,
              "bottom": 50,
              "left": 70,
            }}
            colorBy={d=>color_scale(d.id)}
          />
        </div>
      </div>
    </div>;
  }
}


