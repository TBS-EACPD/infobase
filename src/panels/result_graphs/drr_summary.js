const {
  PanelGraph,
  reactAdapter,
  util_components: {
    TM,
    Format,
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


const PctFormat = ({val}) => <Format type="percentage1" content={val} />;
const StatusTable = ({
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
    <div className="frow middle-xs between-md" style={{marginBottom: "30px"}}>
      <div className="fcol-md-5 col-xs-12 medium_panel_text" >
        <TM 
          k="drr_summary_text"
          args={Object.assign({ subject, num_depts, is_gov }, verbose_counts)} 
        />
      </div>
      <div className="fcol-md-6 col-xs-12">
        <StatusTable {...counts} />
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

