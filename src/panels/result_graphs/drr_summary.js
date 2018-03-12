import classNames from 'classnames';
const {
  PanelGraph,
  reactAdapter,
  util_components: {
    TM,
    Format,
  },
  text_maker,
} = require("../shared");

const { 
  row_to_drr_status_counts,
  result_statuses,
  compute_counts_from_set,
  Result,
  Indicator,
  ResultCounts,
} = require('./results_common.js');

require("./drr_summary_text.ib.yaml");

const { IconArray } = require('../../charts/IconArray.js');

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

  other_success: 'pass',
  other_failure: 'fail',
  other_not_appl: 'na',
  other_not_avail: 'na',
};


const MiniLegend = ({ items }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-start",
      flexWrap: "wrap",
      fontSize: "0.8em",
    }}
  >
    {_.map(items, ({label, id, className}) =>
      <div
        key={id}
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "5px 5px 5px 0",
        }}
      >
        <div 
          style={{
            width: "20px",
            height: "20px",
            marginRight: "10px",
          }}
          className={className}
        />
        <span> {label} </span>
      </div>
    )}
    

  </div>
)

const PctFormat = ({val}) => <Format type="percentage1" content={val} />;
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

    other_success, 
    other_failure, 
    other_not_appl,
    other_not_avail,
  } = props;
  
  
  const past_total = past_success + past_failure + past_not_avail + past_not_appl;
  const future_total = future_success + future_failure + future_not_avail + future_not_appl;
  const other_total = other_success + other_failure + other_not_appl + other_not_avail;

  const include_future_col = future_total > 0;
  const include_past_col = past_total > 0;
  const include_other_col = other_total > 0;

  const include_not_avail_row = other_not_avail + future_not_avail + past_not_avail > 0;
  const include_not_appl_row = other_not_appl + future_not_appl + past_not_appl > 0;

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
          count: (
            shouldFactorDown ? 
            Math.ceil(
            period === "past"  ?
              (key_total/past_total)*max_past_size :
              (key_total/future_total)*max_future_size
            ) : 
            key_total
          ),
        };
      })
      .value();


    return {
      viz_data: _.chain(data)
        .sortBy(({icon_key}) => _.indexOf(icon_order, icon_key) )
        .flatMap( ({count,icon_key}) => {
          return _.range(0,count)
            .map(()=> ({ 
              className: grid_colors[icon_key], 
            }));
        })
        .value(),
      legend_data: _.chain(data)
        .map( ({icon_key}) => ({
          className: grid_colors[icon_key],
          id: icon_key,
          label: text_maker(`${period}_${icon_key}`),
          order: _.indexOf(icon_order, icon_key),
        }))
        .sortBy('order')
        .value(),
      title: (
        period === "past" ?
        text_maker("icon_array_past_header") :
        text_maker("icon_array_future_header")
      ),
    };
  });

  const to_visualize = include_past_col ? [ past_config ] : [];
  if(include_future_col){ 
    to_visualize.push(future_config);
  }

  return (
    <div>
      {_.map( to_visualize, ({ viz_data, legend_data, title },ix) => 
        <div key={ix}>
          <div className="h4">
            {title}
          </div>
          <MiniLegend items={legend_data}  />
          <div>
            <IconArray
              items={viz_data}
              render_item={ ({className}) => 
                <div 
                  className={classNames(icon_array_size_class, className)} 
                />
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}


const OldStatusTable = ({
  past_success, 
  past_failure, 
  past_not_appl, 
  past_not_avail,

  future_success, 
  future_failure, 
  future_not_appl,
  future_not_avail,

  other_success, 
  other_failure, 
  other_not_appl,
  other_not_avail,
}) => {
  const past_total = past_success + past_failure + past_not_avail + past_not_appl;
  const future_total = future_success + future_failure + future_not_avail + future_not_appl;
  const other_total = other_success + other_failure + other_not_appl + other_not_avail;

  const include_future_col = future_total > 0;
  const include_past_col = past_total > 0;
  const include_other_col = other_total > 0;

  const include_not_avail_row = other_not_avail + future_not_avail + past_not_avail > 0;
  const include_not_appl_row = other_not_appl + future_not_appl + past_not_appl > 0;


  return (
    <div style={{overflowX: "auto"}}>
      <table className="table table-dark-bordered table-light-background drr-summary-table">
        <caption> <TM k="indicator_targets" />  </caption>
        <thead>
          <tr className="active">
            <th className="center-text" scope="row"></th>
            { include_past_col && <th className="center-text" scope="col"> <TM k="targets_to_achieve_past" /> </th> }
            { include_future_col && <th className="center-text" scope="col"> <TM k="targets_to_achieve_future_and_ongoing" /> </th> }
            { include_other_col && <th className="center-text" scope="col"> <TM k="targets_to_achieve_other" /> </th> }
          </tr>
        </thead>
        <tbody>
          <tr className="active">
            <th scope="row">
              {result_statuses.past_success.text}
            </th>
            { include_past_col && <td className="right_number success"> <PctFormat val={past_success/past_total}/> </td> }
            { include_future_col && <td className="right_number success disabled-success"></td> }
            { include_other_col && <td className="right_number success"> <PctFormat val={other_success/other_total}/> </td> }
          </tr>
          { include_future_col && 
            <tr className="active">
              <th scope="row">
                {result_statuses.future_success.text}
              </th>
              { include_past_col && <td className="right_number disabled-success success"></td> }
              { include_future_col && <td className="right_number success"> <PctFormat val={future_success/future_total}/> </td> }
              { include_other_col && <td className="right_number disabled-success success"> </td> }
            </tr>
          }
          <tr className="active">
            <th scope="row">
              {result_statuses.future_failure.text}
            </th>
            { include_past_col && <td className="right_number danger"> <PctFormat val={past_failure/past_total}/> </td> }
            { include_future_col && <td className="right_number warning"> <PctFormat val={future_failure/future_total}/> </td> }
            { include_other_col &&  <td className="right_number warning"> <PctFormat val={other_failure/other_total}/> </td> }
          </tr>

          { include_not_avail_row && 
            <tr className="active">
              <th scope="row">
                {result_statuses.past_not_avail.text}
              </th>
              { include_past_col && <td className="right_number"> <PctFormat val={past_not_avail/past_total} /> </td> }
              { include_future_col && <td className="right_number"> <PctFormat val={future_not_avail/future_total}/> </td> }
              { include_other_col && <td className="right_number"> <PctFormat val={other_not_avail/other_total}/> </td> }
            </tr>
          }
          { include_not_appl_row && 
            <tr className="active">
              <th scope="row">
                {result_statuses.past_not_appl.text}
              </th>
              { include_past_col && <td className="right_number"> <PctFormat val={past_not_appl/past_total} /> </td> }
              { include_future_col && <td className="right_number"> <PctFormat val={future_not_appl/future_total}/> </td> }
              { include_other_col && <td className="right_number"> <PctFormat val={other_not_appl/other_total}/> </td> }
            </tr>
          }
          <tr>
            <th scope="row">
              <TM k="total" />
            </th>
            { include_past_col && <td className="right_number"> <PctFormat val={1} /> ({past_total}) </td> }
            { include_future_col && <td className="right_number"> <PctFormat val={1}/> ({future_total}) </td> }
            { include_other_col && <td className="right_number"> <PctFormat val={1}/> ({other_total}) </td> }
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export const DrrSummary = ({ subject, counts, verbose_counts, is_gov, num_depts }) => {

  return (
    <div className="frow middle-xs between-md" style={{marginBottom: "30px"}}>
      <div className="fcol-md-5 fcol-xs-12 medium_panel_text" >
        <TM 
          k="drr_summary_text"
          args={Object.assign({ subject, num_depts, is_gov }, verbose_counts)} 
        />
      </div>
      <div className="fcol-md-6 col-xs-12">
        <StatusGrid {...counts} />
      </div>
    </div>
  );


}

new PanelGraph({
  level: 'dept',
  requires_result_counts: true,
  key: "drr_summary",
  layout: {
    full: {text: [], graph: 12},
    half : {text: [], graph: 12},
  },
  title : "drr_summary_title",
  footnotes: ["RESULTS_COUNTS"],
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
  render(panel, calculations){
    const {
      graph_args,
      subject,
    } = calculations;

    const node = panel.areas().graph.node();

    reactAdapter.render(
      <DrrSummary
        subject={subject}
        {...graph_args}
      />,
      node
    ); 
  },
});

new PanelGraph({
  level: 'program',
  requires_results: true,
  key: "drr_summary",
  layout: {
    full: {text: [], graph: 12},
    half : {text: [], graph: 12},
  },
  title : "drr_summary_title",
  footnotes: ["RESULTS_COUNTS"],
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
  render(panel, calculations){
    const {
      graph_args,
      subject,
    } = calculations;

    const node = panel.areas().graph.node();

    reactAdapter.render(
      <DrrSummary
        subject={subject}
        {...graph_args}
      />,
      node
    ); 
  },
});