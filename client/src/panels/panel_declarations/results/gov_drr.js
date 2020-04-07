import { TM, text_maker } from './drr_summary_text.js';
import {
  Subject,
  InfographicPanel,
  get_source_links,
  declare_panel,
  HeightClippedGraph,
} from "../shared.js";
import {
  row_to_drr_status_counts,
  ResultCounts,
  result_statuses,
  result_docs,
  current_drr_key,
  link_to_results_infograph,
} from './results_common.js';
import { DrrSummary } from './drr_summary.js';
import { LateDepartmentsBanner } from './result_components.js';
import { DisplayTable } from '../../../components/index.js';

const { Gov, Dept } = Subject;

class GovDRR extends React.Component {
  render(){
    const {
      rows_of_counts_by_dept,
      column_names,
      gov_counts,
      num_depts,
      verbose_gov_counts,
      late_dept_count,
      total,
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
          <HeightClippedGraph clipHeight={330}>
            <DisplayTable
              name={"Government DRR"}
              column_names={column_names}
              ordered_column_keys={_.keys(column_names)}
              rows={rows_of_counts_by_dept}
              total_row_config={total}
            />
          </HeightClippedGraph>
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
      
      const column_keys = _.chain(result_statuses)
        .map((row, key) => [`${current_drr_key}_indicators_${key}`, row.text])
        .fromPairs()
        .value();
      
      const rows_of_counts_by_dept = _.map(dept_counts, row => {
        const subject = Dept.lookup(row.id);
        const link_to_subject = <a href={link_to_results_infograph(subject)}>
          {subject.name}
        </a>;
        const display_values = _.chain(column_keys)
          .keys()
          .map(column_key => [column_key, row[column_key]])
          .fromPairs()
          .set("subject_name", link_to_subject)
          .value();
        const sort_values = {...display_values, subject_name: subject.name};
        const search_values = { subject_name: subject.name };

        return {
          display_values,
          sort_values,
          search_values,
        };
      });
      const total = _.chain(column_keys)
        .keys()
        .map(key => [key, "big_int"])
        .fromPairs()
        .value();
      const column_names = _.assignIn({subject_name: text_maker("org")}, column_keys);
      const late_dept_count = result_docs[current_drr_key].late_results_orgs.length;
  
      return {
        gov_counts,
        total,
        rows_of_counts_by_dept,
        column_names,
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
