import { TM, text_maker } from './drr_summary_text.js';
import {
  Subject,
  declare_panel,
  Panel,
  get_source_links,
} from "../shared.js";
import {
  row_to_drr_status_counts,
  ResultCounts,
  result_statuses,
  get_result_doc_keys,
} from './results_common.js';
import { DrrSummary } from './drr_summary.js';
import { HorizontalStatusTable } from './result_components.js';

const { Gov, Dept } = Subject;

const latest_drr_doc_key = _.last( get_result_doc_keys("drr") );

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
                `${latest_drr_doc_key}_indicators_${status_key}`,
                status_text.text,
              ])
              .fromPairs()
              .value()
            }
            doc={latest_drr_doc_key}
          />
        </div>
      </div>
    );
  }
}


export const declare_gov_drr_panel = () => declare_panel({
  panel_key: "gov_drr",
  levels: ["gov"],
  panel_config_func: (level, panel_key) => ({
    level,
    key: panel_key,
    requires_result_counts: true,
    footnotes: ["RESULTS_COUNTS"],
    source: (subject) => get_source_links(["DRR"]),
  
    calculate(){
      const verbose_gov_counts = ResultCounts.get_gov_counts();
      const gov_counts = row_to_drr_status_counts(verbose_gov_counts);
  
      
      const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row[`${latest_drr_doc_key}_total`] > 0 );
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
  }),
});