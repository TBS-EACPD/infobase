const {
  PanelGraph,
  reactAdapter,
  util_components: {
    TM,
    Format,
  },
  declarative_charts: {
    GraphLegend,
  },
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

const {IconArray, FlexIconArray} = require('../../charts/IconArray.js');

const grid_icons = {
  fail : { color: 'red', className: "fas fa-times"  },
  pass : { color: "green", className: "fas fa-check" },
  fail_future : { color: "orange", className: "fas fa-clock"  },
  pass_future : { color: "green", className: "fas fa-clock" },
  question : { color: "#aaa", className: "far fa-question-circle" },
};
const icon_order = {
  pass: 0,
  fail: 5,
  pass_future: 10,
  fail_future: 15,
  question: 25,
};

const status_keys_to_icon_keys = {
  past_success: 'pass',
  past_failure: 'fail',
  past_not_appl: 'question',
  past_not_avail: 'question',

  future_success: 'pass_future',
  future_failure: 'fail_future',
  future_not_appl: 'question',
  future_not_avail: 'question',

  other_success: 'pass',
  other_failure: 'fail',
  other_not_appl: 'question',
  other_not_avail: 'question',
};


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


  let viz_data = _.chain(props)
    .pickBy( (val,key) => status_keys_to_icon_keys[key] && val > 0 )
    .toPairs()
    .groupBy( ([key,val]) => status_keys_to_icon_keys[key] )
    .map( (amounts, icon_key) => ({
      icon_key,
      count: _.sumBy(amounts,1)
    }))
    .pipe(data => {
      //TODO: make maxSize responsive
      const maxSize = 400;
      const total = _.sumBy(data, 'count');
      if(total > maxSize){
        return _.map(data, obj => Object.assign(obj,{ count: obj.count/total*maxSize }) );
      }
      return data;
    })
    .sortBy(({icon_key}) => _.indexOf(icon_order, icon_key) )
    .flatMap( ({count,icon_key}) => {
      return _.range(1,count +1)
        .map(()=> _.clone(grid_icons[icon_key])  );
    })
    .value()

  const legend_data = _.chain(props)
    .pickBy( (val,key) => status_keys_to_icon_keys[key] && val > 0 )
    .toPairs()
    .map( ([key,val])=> ({
      color: grid_icons[status_keys_to_icon_keys[key]].color,
      key,
      order: _.indexOf(icon_order, status_keys_to_icon_keys[key]),
    }))
    .sortBy('order')
    .value();




  return (
    <div 
      style={{
        maxHeight: "300px",
        display: "flex",
        flexDirection:"column",
      }}
    >
      <GraphLegend
        isHorizontal={true} 
        items={ 
          _.map(legend_data, ({key, color}) => ({
            label: key,
            id: key,
            color,
          }))
        } 
      />
      {null&& <IconArray 
        data={viz_data}
        render_item={ ({ data: { className, color } }, max_dim) => {
          return `
            <div 
              style="
                background-color: ${color};
                border-radius: 100%;
                width: ${0.5*max_dim}px;
                height: ${0.5*max_dim}px;
                
              "
            >
            </div>
          `;
        }}
        height={50}
        items_per_row={20}
      />}
      <FlexIconArray
        items={viz_data}
        render_item={ ({color}) => 
          <div
            style={{
              width: "10px",
              height: "10px",
              margin: "5px",
              backgroundColor: color,
              borderRadius: "100%",
            }}
          >
          </div>
        }
      />
    </div>
  )
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

const DrrSummary = ({ subject, counts, verbose_counts, is_gov, num_depts }) => {

  return (
    <div className="frow middle top-xs between-md" style={{marginBottom: "30px"}}>
      <div className="fcol-md-5 col-xs-12 medium_panel_text" >
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

//gov results will re-use the component in a larger panel, so it must be exported.
module.exports = exports = {
  DrrSummary,
};

