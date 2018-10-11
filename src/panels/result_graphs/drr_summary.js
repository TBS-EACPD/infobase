import classNames from 'classnames';
import {
  PanelGraph,
  declarative_charts,
  Panel,
  businessConstants,
} from "../shared";
import { IconArray } from '../../charts/IconArray.js';
import { 
  row_to_drr_status_counts,
  compute_counts_from_set,
  Result,
  Indicator,
  ResultCounts,
  status_key_to_icon_key,
  ordered_icon_keys,
} from './results_common.js';
import { TM, text_maker } from './drr_summary_text.js';

const { A11YTable } = declarative_charts
const { result_simple_statuses } = businessConstants;

const grid_colors = {
  met: "results-icon-array-pass",
  not_met: "results-icon-array-fail",
  not_reported: "results-icon-array-na",
  to_be_achieved: "results-icon-array-neutral",
};

const icon_order = _.chain(ordered_icon_keys)
  .map( (icon_key, ix) => [icon_key, ix*5] )
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
    not_reported,
    to_be_achieved,
  } = props;
  
  const total = met + not_met + not_reported + to_be_achieved;
  const shouldFactorDown = total > max_size;
  const icon_array_size_class = classNames("IconArrayItem", total > 200 && "IconArrayItem__Small", total < 100 && "IconArrayItem__Large");

  const data = _.chain(props)
    .pickBy( (val,key) => (
      status_key_to_icon_key[key] && 
      val > 0 
    ))
    .toPairs()
    .groupBy( ([key, val]) => status_key_to_icon_key[key] )
    .map( (amounts, icon_key) => {
      const key_total = _.sumBy(amounts, 1);
      return {
        icon_key,
        viz_count: (
          shouldFactorDown ? 
            Math.ceil( (key_total/total)*max_size ) : 
            key_total
        ),
        real_count: key_total,
      };
    })
    .value();

  const title = "DRRTODO: subtitle, maybe explain date to be achieved and 'future' items here?"

  const viz_data = _.chain(data)
    .sortBy( ({icon_key}) => icon_order[icon_key] )
    .flatMap( ({viz_count,icon_key}) => {
      return _.range(0, viz_count)
        .map( 
          () => ({ icon_key }) 
        );
    })
    .value();

  const legend_data = _.chain(data)
    .map( ({icon_key}) => ({
      className: grid_colors[icon_key],
      id: icon_key,
      label: result_simple_statuses[icon_key].text,
      order: icon_order[icon_key],
    }))
    .sortBy('order')
    .value();

  const a11y_data = is_a11y_mode && {
    label_col_header: text_maker('status'),
    data: _.map(data, ({icon_key, real_count}) => ({
      label: result_simple_statuses[icon_key].text,
      data: [ real_count ],
    })),
    data_col_headers: [ title ],
  };


  if(is_a11y_mode){
    return <div>
      <A11YTable
        {...a11y_data}
      />
    </div>
  }

  return (
    <div>
      <div className="h3">
        <TM k="results_icon_array_title" />
      </div>
      <div>
        <div className="h4">
          {title}
        </div>
        <MiniLegend items={legend_data} />
        <div>
          { 
            _.chain(viz_data)
              .groupBy("icon_key")
              .map( (group, icon_key) => ([group,icon_key]) )
              .sortBy( ([group,icon_key]) => icon_order[icon_key] )
              .map( ([group, icon_key]) => 
                <IconArray
                  key={icon_key}
                  items={group}
                  render_item={ ({icon_key}) => 
                    <div 
                      className={classNames(icon_array_size_class, grid_colors[icon_key])} 
                    />
                  }
                />
              ).value()
          }
        </div>
      </div>
    </div>
  );
}


export const DrrSummary = ({ subject, counts, verbose_counts, is_gov, num_depts }) => {

  return (
    <div className="frow middle-xs between-md" style={{marginBottom: "30px"}}>
      <div className="fcol-md-5 fcol-xs-12 medium_panel_text" >
        <TM 
          k="drr_summary_text"
          args={{ subject, num_depts, is_gov, ...verbose_counts }} 
        />
      </div>
      <div className="fcol-md-6 col-xs-12">
        <StatusGrid {...counts} />
      </div>
    </div>
  );


}

const render = ({calculations, footnotes}) => {
  const {
    graph_args,
    subject,
  } = calculations;

  return (
    <Panel title={text_maker("drr_summary_title")} footnotes={footnotes}>
      <DrrSummary
        subject={subject}
        {...graph_args}
      />
    </Panel>
  );
};

new PanelGraph({
  level: 'dept',
  requires_result_counts: true,
  key: "drr_summary",
  footnotes: ["RESULTS_COUNTS", "RESULTS"],

  calculate(subject){
    const verbose_counts = ResultCounts.get_dept_counts(subject.acronym);
    const counts = row_to_drr_status_counts(verbose_counts);

    if(verbose_counts.drr17_total < 1){
      return false;
    }

    return {
      verbose_counts,
      counts,
    };
  },
  render,
});

new PanelGraph({
  level: 'program',
  requires_results: true,
  key: "drr_summary",
  footnotes: ["RESULTS_COUNTS", "RESULTS"],

  calculate(subject){
    const all_results = Result.get_flat_results(subject);
    const all_indicators = Indicator.get_flat_indicators(subject);

    if( !_.find(all_indicators, {doc: 'drr17'}) ){
      return false;
    }

    const verbose_counts = compute_counts_from_set({results: all_results, indicators: all_indicators });
    const counts = row_to_drr_status_counts(verbose_counts);
    
    return {
      verbose_counts,
      counts,
    };
  },
  render,
});