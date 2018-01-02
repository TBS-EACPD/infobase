const {
  Subject: {
    Dept,
    Gov,
  },
  PanelGraph,
  reactAdapter,
  util_components: {
    TM,
  },
} = require("../shared"); 


const {
  link_to_results_infograph,
  row_to_drr_status_counts,
  ResultCounts,
} = require('./results_common.js');

const { DrrSummary } = require('./drr_summary.js');

new PanelGraph({
  level: 'gov',
  requires_result_counts: true,
  key: "gov_drr",
  layout: {
    full: {text: [], graph: 12},
    half : {text: [], graph: 12},
  },
  title : "drr_summary_title",
  footnotes: ["RESULTS_COUNTS"],
  calculate(){
    const verbose_gov_counts = ResultCounts.get_gov_counts();
    const gov_counts = row_to_drr_status_counts(verbose_gov_counts);

    
    const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row.drr16_total > 0 );
    const num_depts = dept_counts.length;

    const counts_by_dept = _.chain(dept_counts)
      .map( row => ({ 
        subject: Dept.lookup(row.id),
        counts: row,
      }))
      .map( obj => _.immutate(obj, { total: d4.sum(_.values(obj.counts)) } ) )
      .value();


    return {
      gov_counts,
      counts_by_dept,
      verbose_gov_counts,
      num_depts,
    };
    
  },
  render(panel, calculations){
    const {
      graph_args,
    } = calculations;

    const node = panel.areas().graph.node();

    reactAdapter.render(
      <GovDRR
        {...graph_args}
      />,
      node
    ); 
  },
});

class GovDRR extends React.Component {
  render(){
    const {
      counts_by_dept,
      gov_counts,
      num_depts,
      verbose_gov_counts, 
    } = this.props;

    return <div>
      <DrrSummary
        subject={Gov}
        verbose_counts={verbose_gov_counts}
        counts={gov_counts}
        is_gov={true}
        num_depts={num_depts}
      />
      <div>
        <div className="medium_panel_text">
          <TM k="gov_drr_summary_org_table_text" />
        </div>
        <HorizontalStatusTable 
          counts_by_dept={counts_by_dept}
          gov_counts={gov_counts}
        />
      </div>
      
    </div>
  }
}



class HorizontalStatusTable extends React.Component {
  constructor(){
    super();
    this.state = {
      sort_by: 'drr16_total',
      descending: true,
      show_all: false,
    };
  }

  header_click(col_name){
    this.setState({
      sort_by: col_name,
      descending: (
        this.state.sort_by === col_name ?
        !this.state.descending :
        true
      ),
    });
  }

  render(){
    const { counts_by_dept } = this.props;
    const { sort_by, descending, show_all } = this.state;


    const simpler_counts = (
      _.chain(counts_by_dept)
        .reject( ({counts}) => counts.drr16_total === 0)
        .sortBy(row => row.counts.drr16_total )
        .reverse()
        .pipe( show_all ? _.identity :  list => _.take(list, 15)  )
        .sortBy( 
          sort_by ==='subject' ? 
          ({subject}) => subject.name : 
          row => row.counts[sort_by]
        )
        .pipe( descending ? arr => arr.reverse() : _.identity )
        .value()
    );

    return <div>
      <table className="table table-dark-blue table-dark-bordered no-total-row">
        <caption> <TM k="indicator_targets" />  </caption>
        <thead>
          <tr className="table-header">
            <th className="center-text" role="col">
              <TM k="org" />
            </th>

            <th className="center-text" role="col">
              <TM k="targets_to_achieve_past" />
            </th>

            <th className="center-text" role="col">
              <TM k="targets_to_achieve_future_and_ongoing" />
            </th>

            <th className="center-text" role="col">
              <TM k="targets_to_achieve_other" />
            </th>

          </tr>
        </thead>
        <tbody>
          {_.map(simpler_counts, ({ subject, counts }) => 
            <tr key={subject.id}>
              <td>
                <a href={link_to_results_infograph(subject)}>
                  {subject.name}
                </a>
              </td> 

              {_.map(['drr16_past_total', 'drr16_future_total', 'drr16_other_total'], status => 
                <td key={status} className="right_number">
                  {counts[status]}
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
      { !show_all && 
        <div style={{textAlign: 'right'}}>
          <button 
            className="btn btn-ib-primary"
            onClick={()=>{ this.setState({ show_all: true }) }}
          >
            <TM k="show_all_orgs" />
          </button>
        </div>
      }
    </div>;
  }

}
