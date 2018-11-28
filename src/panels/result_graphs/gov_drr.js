import { TM, text_maker } from './drr_summary_text.js';
import {
  Subject,
  PanelGraph,
  Panel,
  util_components,
} from "../shared.js";
import {
  link_to_results_infograph,
  row_to_drr_status_counts,
  ResultCounts,
  result_statuses,
} from './results_common.js';
import { DrrSummary } from './drr_summary.js';

const { Gov, Dept } = Subject;

const { SortIndicators } = util_components;

new PanelGraph({
  level: 'gov',
  requires_result_counts: true,
  key: "gov_drr",
  footnotes: ["RESULTS_COUNTS"],

  calculate(){
    const verbose_gov_counts = ResultCounts.get_gov_counts();
    const gov_counts = row_to_drr_status_counts(verbose_gov_counts);

    
    const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row.drr17_total > 0 );
    const num_depts = dept_counts.length;

    const counts_by_dept = _.chain(dept_counts)
      .map( row => ({ 
        subject: Dept.lookup(row.id),
        counts: row,
      }))
      .map( obj => ({...obj, total: d3.sum(_.values(obj.counts)) } ) )
      .value();


    return {
      gov_counts,
      counts_by_dept,
      verbose_gov_counts,
      num_depts,
    };
    
  },

  render({calculations,footnotes}){
    const {
      graph_args,
    } = calculations;
    
    return (
      <Panel
        title={text_maker("drr_summary_title")}
        {...footnotes}
      >
        <GovDRR {...graph_args} />
      </Panel>
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
      <div
        className = { 'alert alert-no-symbol alert--is-bordered alert-info' }
      >
        { 
          {
            en: "The count of indicators does not include indicators for Indigenous and Northern Affairs Canada, Indigenous Services Canada, and Transport Canada. This information will be updated as soon as their data is submitted.",
            fr: "Le nombre indicateurs n’inclus pas les indicateurs pour Affaires autochtones et du Nord Canada, Services aux Autochtones Canada, et Transports Canada. L’information sera mise-à-jour dès que les données auront été soumises.",
          }[window.lang] // Temporary banner, will go away shortly hopefully
        }
      </div>
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
          gov_counts={verbose_gov_counts}
        />
      </div>
      
    </div>
  }
}



class HorizontalStatusTable extends React.Component {
  constructor(){
    super();
    this.state = {
      sort_by: 'drr17_indicators_met',
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
    const { counts_by_dept, gov_counts } = this.props;
    const { sort_by, descending, show_all } = this.state;

    const status_rows = [
      'drr17_indicators_met',
      'drr17_indicators_not_met',
      'drr17_indicators_not_available',
      'drr17_indicators_future',
    ];

    const sorted_filtered_counts = _.chain(counts_by_dept)
      .reject( ({counts}) => counts.drr17_total === 0)
      .sortBy(row => row.counts.drr17_total )
      .reverse()
      .pipe( show_all ? _.identity : list => _.take(list, 15) )
      .sortBy( 
        sort_by ==='subject' ? 
          ({subject}) => subject.name : 
          row => row.counts[sort_by]
      )
      .pipe( descending ? arr => arr.reverse() : _.identity )
      .value();

    return <div style={{overflowX: "auto"}}>
      <table className="table table-dark-blue table-dark-bordered no-total-row">
        <caption className="sr-only" > <TM k="indicator_targets" />  </caption>
        <thead>
          <tr className="table-header">
            <th 
              className="center-text" 
              role="col"
              onClick={ () => this.header_click("subject") }
            >
              <TM k="org" />
              <SortIndicators 
                asc={!descending && sort_by === "subject"} 
                desc={descending && sort_by === "subject"}
              />
            </th>
            {
              _.map(result_statuses, (status_text, status_key) => {
                const col_name = `drr17_indicators_${status_key}`;
                return (
                  <th 
                    key={status_key} 
                    className="center-text" 
                    role="col"
                    onClick={ () => this.header_click(col_name) }
                  >
                    { status_text.text }
                    <SortIndicators 
                      asc={!descending && sort_by === col_name} 
                      desc={descending && sort_by === col_name}
                    />
                  </th>
                );
              })
            }
          </tr>
        </thead>
        <tbody>
          {_.map(sorted_filtered_counts, ({ subject, counts }) => 
            <tr key={subject.id}>
              <td>
                { subject.level === "gov" && <TM k="goc_total"/> }
                { subject.level === "dept" &&
                  <a href={link_to_results_infograph(subject)}>
                    {subject.name}
                  </a>
                }
              </td> 

              {_.map(
                status_rows, 
                status => (
                  <td key={status} className="right_number">
                    {counts[status]}
                  </td>
                )
              )}
            </tr>
          )}
          <tr>
            <td>
              <TM k="goc_total"/>
            </td>
            {_.map(
              status_rows, 
              status => (
                <td key={status} className="right_number">
                  {gov_counts[status]}
                </td>
              )
            )}
          </tr>
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
