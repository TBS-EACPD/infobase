import './drr_summary.scss';
import { TM, text_maker } from './drr_summary_text.js';

import classNames from 'classnames';
import { Fragment } from 'react';

import {
  declarative_charts,
  InfographicPanel,
  businessConstants,
  get_source_links,
  Results,

  declare_panel,

  NivoResponsivePie,

} from "../shared.js";
import { 
  row_to_drr_status_counts,
  ResultCounts,
  GranularResultCounts,
  ordered_status_keys,
  filter_and_genericize_doc_counts,
  result_statuses,
} from './results_common.js';

import { IconArray } from '../../../charts/IconArray.js';

const { A11YTable, GraphLegend } = declarative_charts;
const { result_simple_statuses } = businessConstants;
const { current_drr_key, result_docs } = Results;

const current_drr_year = result_docs[current_drr_key].year;
const current_drr_target_year = _.toNumber(result_docs[current_drr_key].year_short) + 1;

const grid_colors = {
  met: "results-icon-array-pass",
  not_met: "results-icon-array-fail",
  not_available: "results-icon-array-na",
  future: "results-icon-array-neutral",
};

const result_color_scale = d3.scaleOrdinal()
  .domain(["met","not_met","not_available","future"])
  .range([
    window.infobase_color_constants.successDarkColor,
    window.infobase_color_constants.failDarkColor,
    window.infobase_color_constants.warnDarkColor,
    window.infobase_color_constants.tertiaryColor,
  ]);

const icon_order = _.chain(ordered_status_keys)
  .map( (status_key, ix) => [status_key, ix*5] )
  .fromPairs()
  .value();

const MiniLegend = ({ items }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      fontSize: "0.87em",
      marginBottom: "5px",
    }}
  >
    {_.map(items, ({label, id, className}) =>
      <div
        key={id}
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "5px 15px 5px 0",
        }}
      >
        <div 
          style={{
            width: "20px",
            height: "20px",
            marginRight: "5px",
          }}
          className={className}
          title={result_statuses[id].text}
        />
        <span> {label} </span>
      </div>
    )}
  </div>
);

const StatusGrid = props => {
  const max_size = 800;

  const {
    met,
    not_met,
    not_available,
    future,
  } = props;
  
  const total = met + not_met + not_available + future;
  const shouldFactorDown = total > max_size;
  const icon_array_size_class = classNames("IconArrayItem", total > 200 && "IconArrayItem__Small", total < 100 && "IconArrayItem__Large");

  const data = _.chain(props)
    .pickBy( (val, key) => key && val > 0 )
    .toPairs()
    .groupBy( ([key, val]) => key )
    .map( (amounts, status_key) => {
      const key_total = _.sumBy(amounts, 1);
      return {
        status_key,
        viz_count: (
          shouldFactorDown ? 
            Math.ceil( (key_total/total)*max_size ) :
            key_total
        ),
        real_count: key_total,
      };
    })
    .value();

  const viz_data = _.chain(data)
    .sortBy( ({status_key}) => icon_order[status_key] )
    .flatMap( ({viz_count, status_key}) => {
      return _.range(0, viz_count)
        .map( 
          () => ({ status_key }) 
        );
    })
    .value();

  const legend_data = _.chain(data)
    .map( ({status_key}) => ({
      className: grid_colors[status_key],
      id: status_key,
      label: result_simple_statuses[status_key].text,
      order: icon_order[status_key],
    }))
    .sortBy('order')
    .value();

  const a11y_data = is_a11y_mode && {
    label_col_header: text_maker('status'),
    data: _.map(data, ({status_key, real_count}) => ({
      label: result_simple_statuses[status_key].text,
      data: [ real_count ],
    })),
    data_col_headers: [ text_maker('results_icon_array_title', {year: current_drr_year}) ],
  };


  if(is_a11y_mode){
    return (
      <div>
        <A11YTable
          {...a11y_data}
        />
      </div>
    );
  }

  return (
    <div>
      <div>
        <MiniLegend items={legend_data} />
        <div>
          { 
            _.chain(viz_data)
              .groupBy("status_key")
              .map( (group, status_key) => ([group,status_key]) )
              .sortBy( ([group,status_key]) => icon_order[status_key] )
              .map( ([group, status_key]) => 
                <IconArray
                  key={status_key}
                  items={group}
                  render_item={ ({status_key}) => 
                    <div 
                      className={classNames(icon_array_size_class, grid_colors[status_key])} 
                      title={result_statuses[status_key].text}
                    />
                  }
                />
              ).value()
          }
        </div>
      </div>
    </div>
  );
};



class PercentageViz extends React.Component {
  constructor(props){
    super(props);
    const { counts } = this.props;

    const all_ids = _.keys(counts);

    this.state = {
      selected: _.filter(all_ids, id => id !== "future"), // default to no future
    };
  }

  render(){
    const { counts } = this.props;
    const { selected } = this.state;

    const data = _.chain(counts)
      .toPairs()
      .map(pair => ({label: result_statuses[pair[0]].text, value: pair[1], id: pair[0]}))
      .value();
    

    const graph_data = _.filter(data, d=>_.includes(selected,d.id));
    const graph_total = _.sumBy(graph_data, 'value');

    const new_summary_text_args = {
      drr_total: graph_total,
      drr_indicators_met: _.includes(selected, 'met') && counts.met,
      drr_indicators_not_met: _.includes(selected, 'not_met') && counts.not_met,
      drr_indicators_not_available: _.includes(selected, 'not_available') && counts.not_available,
      drr_indicators_future: _.includes(selected, 'future') && counts.future,
    };

    return (
      <Fragment>
        <div className="frow">
          <div className="fcol-md-4 fcol-xs-4 medium_panel_text" >
            <TM
              k="new_drr_summary_text_summary"
              args={new_summary_text_args} 
            />
          </div>
          <div className="fcol-md-4 fcol-xs-4 medium_panel_text" >
            <div style={{height: '280px'}} aria-hidden = {true}>
              <NivoResponsivePie
                data = {graph_data}
                colorBy = {obj=>result_color_scale(obj.id)}
                total = {graph_total}
                height = '280px'
                is_money = {false}
                margin = {{
                  top: 30,
                  right: 30,
                  bottom: 30,
                  left: 30,
                }}
              />
            </div>
          </div>
          <div className="fcol-md-4 fcol-xs-4" >
            <div className="medium_panel_text">
              {text_maker("graph_legend_instructions")}
            </div>
            <div className="legend-container">
              <GraphLegend
                items={_.chain(data)
                  .map( ({ label, id }) => ({
                    label: label,
                    active: _.includes(selected, id),
                    id,
                    color: result_color_scale(id),
                  }))
                  .value()
                }
                onClick={id => {!(selected.length === 1 && selected.includes(id)) &&
                  this.setState({
                    selected: _.toggle_list(selected, id),
                  });
                }}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  };
};

export const DrrSummary = ({ subject, counts, verbose_counts, is_gov, num_depts }) => {
  const current_drr_counts_with_generic_keys = filter_and_genericize_doc_counts(verbose_counts, current_drr_key);

  const summary_text_args = { 
    subject, 
    num_depts, 
    is_gov, 
    year: current_drr_year,
    target_year: current_drr_target_year,
    ...current_drr_counts_with_generic_keys,
  };

  return <Fragment>
    <div className="frow middle-xs between-md">
      <div className="fcol-md-12 fcol-xs-12 medium_panel_text" >
        <TM k="drr_summary_text_intro" args={summary_text_args} />
      </div>
    </div>
    <div className="frow middle-xs between-md">
      <div className="fcol-md-7 fcol-xs-7 medium_panel_text" >
        <div style={{padding: "10px"}}>
          <TM k="result_status_explanation"/>
        </div>
      </div>
      <div className="fcol-md-5 fcol-xs-5" >
        <div style={{padding: "30px"}}>
          <StatusGrid {...counts} />
        </div>
      </div>
    </div>
    <div className="frow middle-xs between-md" style={{marginBottom: "30px"}} >
      <div className={"fcol-md-12 fcol-xs-12"} >
        <PercentageViz summary_text_args={summary_text_args} counts={counts} />
      </div>
    </div>
  </Fragment>;
};

const render = ({calculations, footnotes, sources}) => {
  const {
    panel_args,
    subject,
  } = calculations;

  return (
    <InfographicPanel title={text_maker("drr_summary_title", {year: current_drr_year})} footnotes={footnotes} sources={sources}>
      <DrrSummary
        subject={subject}
        {...panel_args}
      />
    </InfographicPanel>
  );
};


export const declare_drr_summary_panel = () => declare_panel({
  panel_key: "drr_summary",
  levels: ["dept", "crso", "program"],
  panel_config_func: (level, panel_key) => ({
    requires_result_counts: level === "dept",
    requires_granular_result_counts: level !== "dept",
    footnotes: ["RESULTS_COUNTS", "RESULTS"],
    source: (subject) => get_source_links(["DRR"]),
    calculate(subject){
      const verbose_counts = (() => {
        switch (level){
          case 'dept':
            return ResultCounts.get_dept_counts(subject.id);
          case 'crso':
            return _.chain([
              subject.id, 
              ..._.map(subject.programs, 'id'),
            ])
              .map( (id) => GranularResultCounts.get_subject_counts(id) )
              .reduce(
                (accumulator, counts) => _.mergeWith(accumulator, counts, _.add),
                {}
              )
              .value();
          case 'program':
            return GranularResultCounts.get_subject_counts(subject.id);
        }
      })();

      const counts = row_to_drr_status_counts(verbose_counts, current_drr_key);
    
      if(verbose_counts[`${current_drr_key}_total`] < 1){
        return false;
      }
    
      return {
        verbose_counts,
        counts,
      };
    },
    render,
  }),
});
