import { TM, text_maker } from './drr_summary_text.js';
import {
  Subject,
  PanelGraph,
  Panel,
  get_source_links,
} from "../shared.js";
import {
  row_to_drr_status_counts,
  ResultCounts,
  result_docs,
  result_statuses,
} from './results_common.js';
import { DrrSummary } from './drr_summary.js';
import { HorizontalStatusTable } from './result_components.js';

const { Gov, Dept } = Subject;

const latest_drr_doc = _.chain(result_docs)
  .keys()
  .filter( doc_key => /drr/.test(doc_key) )
  .last()
  .value();


new PanelGraph({
  level: 'gov',
  requires_result_counts: true,
  key: "gov_drr",
  footnotes: ["RESULTS_COUNTS"],
  source: (subject) => get_source_links(["DRR"]),

  calculate(){
    const verbose_gov_counts = ResultCounts.get_gov_counts();
    const gov_counts = row_to_drr_status_counts(verbose_gov_counts);

    
    const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row[`${latest_drr_doc}_total`] > 0 );
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

  render({calculations, footnotes, sources}){
    const {
      graph_args,
    } = calculations;

    return (
      <Panel
        title={text_maker("drr_summary_title")}
        { ...{footnotes, sources} }
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

    return (
      <div>
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
            status_columns={_.chain(result_statuses)
              .map( (status_text, status_key) => [
                `${latest_drr_doc}_indicators_${status_key}`,
                status_text.text,
              ])
              .fromPairs()
              .value()
            }
            doc={latest_drr_doc}
          />
        </div>
      </div>
    );
  }
}
