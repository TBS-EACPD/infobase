import classNames from 'classnames';
import {
  PanelGraph,
  declarative_charts,
  Panel,
} from "../shared";
import { IconArray } from '../../charts/IconArray.js';


import { 
  row_to_drr_status_counts,
  compute_counts_from_set,
  Result,
  Indicator,
  ResultCounts,
} from './results_common.js';
import { TM, text_maker } from './drr_summary_text.js';


const { A11YTable } = declarative_charts


const grid_colors = {
  fail: "results-icon-array-fail",
  pass: "results-icon-array-pass",
  na:  "results-icon-array-na",
};

const icon_order = {
  pass: 0,
  fail: 5,
  na: 10,
};

const status_keys_to_icon_keys = {
  past_success: 'pass',
  past_failure: 'fail',
  past_not_appl: 'na',
  past_not_avail: 'na',

  future_success: 'pass',
  future_failure: 'fail',
  future_not_appl: 'na',
  future_not_avail: 'na',
};


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
)

const StatusGrid = props => {
  const {
    past_success, 
    past_failure, 
    past_not_appl, 
    past_not_avail,

    future_success, 
    future_failure, 
    future_not_appl,
    future_not_avail,

  } = props;
  
  
  const past_total = past_success + past_failure + past_not_avail + past_not_appl;
  const future_total = future_success + future_failure + future_not_avail + future_not_appl;

  const include_future_col = future_total > 0;
  const include_past_col = past_total > 0;

  const maxSize = 800;
  const non_other_total = past_total + future_total;
  const shouldFactorDown = non_other_total > maxSize;
  const max_past_size = Math.ceil(past_total/non_other_total*maxSize);
  const max_future_size = Math.ceil(future_total/non_other_total*maxSize);
  const icon_array_size_class = classNames("IconArrayItem", non_other_total > 200 && "IconArrayItem__Small", non_other_total < 100  && "IconArrayItem__Large");

  const [ past_config, future_config ]  = _.map(["past","future"], period => {
    const data = _.chain(props)
      .pickBy( (val,key) => (
        _.startsWith(key, period) && 
        status_keys_to_icon_keys[key] && 
        val > 0 
      ))
      .toPairs()
      .groupBy( ([key,val]) => status_keys_to_icon_keys[key] )
      .map( (amounts, icon_key) => {
        const key_total = _.sumBy(amounts,1);

        return {
          icon_key,
          viz_count: (
            shouldFactorDown ? 
            Math.ceil(
            period === "past"  ?
              (key_total/past_total)*max_past_size :
              (key_total/future_total)*max_future_size
            ) : 
            key_total
          ),
          real_count: key_total,
        };
      })
      .value();


    const period_title= (
      period === "past" ?
      text_maker("targets_to_achieve_past") :
      text_maker("targets_to_achieve_future_and_ongoing")
    );

    return {
      viz_data: _.chain(data)
        .sortBy(({icon_key}) => icon_order[icon_key] )
        .flatMap( ({viz_count,icon_key}) => {
          return _.range(0,viz_count)
            .map(()=> ({ icon_key }));
        })
        .value(),
      legend_data: _.chain(data)
        .map( ({icon_key}) => ({
          className: grid_colors[icon_key],
          id: icon_key,
          label: text_maker(`${period}_${icon_key}`),
          order: icon_order[icon_key],
        }))
        .sortBy('order')
        .value(),
      title: period_title,
      a11y_data: is_a11y_mode && {
        label_col_header: text_maker('status'),
        data: _.map(data, ({icon_key, real_count}) => ({
          label: text_maker(`${period}_${icon_key}`),
          data: [ real_count ] ,
        })),
        data_col_headers: [ period_title ],
      },
    };
  });

  if(is_a11y_mode){

    return <div>
      <A11YTable
        {...past_config.a11y_data}
      />
      <A11YTable
        {...future_config.a11y_data}
      />
    </div>
  }

  const to_visualize = include_past_col ? [ past_config ] : [];
  if(include_future_col){ 
    to_visualize.push(future_config);
  }


  return (
    <div>
      <div className="h3">
        <TM k="results_icon_array_title" />
      </div>
      {_.map( to_visualize, ({ viz_data, legend_data, title },ix) => 
        <div key={ix}>
          <div className="h4">
            {title}
          </div>
          <MiniLegend items={legend_data}  />
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
      )}
    </div>
  );
}


export const DrrSummary = ({ subject, counts, verbose_counts, is_gov, num_depts }) => {

  return (
    <div className="frow middle-xs between-md" style={{marginBottom: "30px"}}>
      <div className="fcol-md-5 fcol-xs-12 medium_panel_text" >
        <TM 
          k="drr_summary_text"
          args={{ subject, num_depts, is_gov, ...verbose_counts}} 
        />
      </div>
      <div className="fcol-md-6 col-xs-12">
        <StatusGrid {...counts} />
      </div>
    </div>
  );


}

const render = ({calculations,footnotes}) => {
  const {
    graph_args,
    subject,
  } = calculations;

  return <Panel title={text_maker("drr_summary_title")} footnotes={footnotes}>
    <DrrSummary
      subject={subject}
      {...graph_args}
    />
  </Panel>;
};

new PanelGraph({
  level: 'dept',
  requires_result_counts: true,
  key: "drr_summary",
  footnotes: ["RESULTS_COUNTS","RESULTS"],

  calculate(subject){
    const verbose_counts = ResultCounts.get_dept_counts(subject.acronym);
    const counts = row_to_drr_status_counts(verbose_counts);

    if(verbose_counts.drr16_total < 1){
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
  footnotes: ["RESULTS_COUNTS","RESULTS"],

  calculate(subject){
    const all_results = Result.get_flat_results(subject);
    const all_indicators = Indicator.get_flat_indicators(subject);

    if(!_.find(all_indicators, {doc: 'drr16'})){
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