import text from './gov_dp.yaml';

import { Fragment } from 'react';

import {
  Subject,
  create_text_maker_component,
  InfographicPanel,
  get_source_links,
  declare_panel,
  HeightClippedGraph,
} from "../shared.js";
import {
  ResultCounts,
  filter_and_genericize_doc_counts,
  current_dp_key,
  result_docs,
  link_to_results_infograph,
} from './results_common.js';
import { LateDepartmentsBanner } from './result_components.js';
import { DisplayTable } from '../../../components';

const { Dept } = Subject;
const { text_maker, TM } = create_text_maker_component(text);

const current_dp_year = result_docs[current_dp_key].year;
const current_dp_corresponding_drr_year = _.toNumber(result_docs[current_dp_key].year_short) + 1;


const DpSummary = ({counts, rows_of_counts_by_dept, total, column_names, late_dept_count}) => {
  const current_dp_counts_with_generic_keys = filter_and_genericize_doc_counts(counts, current_dp_key);
  return (
    <Fragment>
      <div className="fcol-md-12 medium_panel_text">
        { late_dept_count > 0 && <LateDepartmentsBanner late_dept_count={late_dept_count} /> }
        <TM 
          k="gov_dp_text"
          args={{
            ...current_dp_counts_with_generic_keys, 
            depts_with_dps: rows_of_counts_by_dept.length,
            year: current_dp_year,
            drr_tabling_year: current_dp_corresponding_drr_year,
          }}
        />
      </div>
      <HeightClippedGraph clipHeight={330}>
        <DisplayTable
          name={"Government DP"}
          rows={rows_of_counts_by_dept}
          column_names={column_names}
          total={total}
        />
      </HeightClippedGraph>
    </Fragment>
  );
};
  

export const declare_gov_dp_panel = () => declare_panel({
  panel_key: "gov_dp",
  levels: ["gov"],
  panel_config_func: (level, panel_key) => ({
    requires_result_counts: true,
    calculate: () => {      
      const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row[`${current_dp_key}_results`] > 0 );
      const verbose_gov_counts = ResultCounts.get_gov_counts();

      const column_keys = {
        [`${current_dp_key}_results`]: text_maker("results"),
        [`${current_dp_key}_indicators`]: text_maker("indicators"),
      };

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
        .map(key => [key, verbose_gov_counts[key]])
        .fromPairs()
        .value();
      const column_names = _.assignIn({subject_name: text_maker("org")}, column_keys);
      const late_dept_count = result_docs[current_dp_key].late_results_orgs.length;

      return { 
        column_names,
        total,
        rows_of_counts_by_dept,
        late_dept_count,
      };
    },
    footnotes: ["DP_RESULTS"],
    source: (subject) => get_source_links(["DP"]),
    render({ calculations, sources, footnotes}){
      const {
        panel_args: {
          column_names,
          total,
          rows_of_counts_by_dept,
          late_dept_count,
        },
      } = calculations;
      const counts = ResultCounts.get_gov_counts();
  
      return (
        <InfographicPanel
          title={text_maker("gov_dp_summary_title", {year: current_dp_year})}
          sources={sources}
          footnotes={footnotes}
          allowOverflow
        >
          <DpSummary 
            counts={counts}
            total={total}
            column_names={column_names}
            rows_of_counts_by_dept={rows_of_counts_by_dept}
            late_dept_count={late_dept_count}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
