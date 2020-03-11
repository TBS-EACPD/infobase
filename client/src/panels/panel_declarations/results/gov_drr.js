import { TM, text_maker } from './drr_summary_text.js';
import {
  Subject,
  InfographicPanel,
  get_source_links,
  
  declare_panel,
} from "../shared.js";
import {
  row_to_drr_status_counts,
  ResultCounts,
  result_statuses,
  result_docs,
  current_drr_key,
} from './results_common.js';
import { DrrSummary } from './drr_summary.js';
import {
  HorizontalStatusTable,
  LateDepartmentsBanner,
} from './result_components.js';

const { Gov, Dept } = Subject;

class GovDRR extends React.Component {
  render(){
    const {
      counts_by_dept,
      gov_counts,
      num_depts,
      verbose_gov_counts,
      late_dept_count, 
    } = this.props;

    return (
      <div>
        { late_dept_count > 0 &&
          <div className="medium_panel_text">
            <LateDepartmentsBanner late_dept_count={late_dept_count} />
          </div>
        }
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
                `${current_drr_key}_indicators_${status_key}`,
                status_text.text,
              ])
              .fromPairs()
              .value()
            }
            doc={current_drr_key}
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
    requires_result_counts: true,
    footnotes: ["RESULTS_COUNTS", "DRR_RESULTS"],
    source: (subject) => get_source_links(["DRR"]),
  
    calculate(){
      const verbose_gov_counts = ResultCounts.get_gov_counts();
      const gov_counts = row_to_drr_status_counts(verbose_gov_counts, current_drr_key);
  
      
      const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row[`${current_drr_key}_total`] > 0 );
      const num_depts = dept_counts.length;
  
      const counts_by_dept = _.chain(dept_counts)
        .map( row => ({ 
          subject: Dept.lookup(row.id),
          counts: row,
        }))
        .map( obj => ({...obj, total: d3.sum(_.values(obj.counts)) } ) )
        .value();
  
      const late_dept_count = result_docs[current_drr_key].late_departments.length;
  
      return {
        gov_counts,
        counts_by_dept,
        verbose_gov_counts,
        num_depts,
        late_dept_count,
      };
    },
  
    render({calculations, footnotes, sources}){
      const {
        panel_args,
      } = calculations;
  
      return (
        <InfographicPanel
          title={text_maker("drr_summary_title", {year: result_docs[current_drr_key].year})}
          { ...{footnotes, sources} }
        >
          <GovDRR {...panel_args} />
        </InfographicPanel>
      );
    },
  }),
});
