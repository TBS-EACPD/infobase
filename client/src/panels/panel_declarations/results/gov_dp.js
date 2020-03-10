import text from './gov_dp.yaml';

import { Fragment } from 'react';

import {
  Subject,
  create_text_maker_component,
  InfographicPanel,
  get_source_links,

  declare_panel,
} from "../shared.js";
const { Dept } = Subject;

import {
  ResultCounts,
  filter_and_genericize_doc_counts,
  current_dp_key,
  result_docs,
} from './results_common.js';
import { HorizontalStatusTable } from './result_components.js';

const { text_maker, TM } = create_text_maker_component(text);

const current_dp_year = result_docs[current_dp_key].year;
const current_dp_corresponding_drr_year = _.toNumber(result_docs[current_dp_key].year_short) + 1;


const DpSummary = ({counts, verbose_gov_counts, counts_by_dept}) => {
  const current_dp_counts_with_generic_keys = filter_and_genericize_doc_counts(counts, current_dp_key);

  return (
    <Fragment>
      <div className="fcol-md-12 medium_panel_text">
        <TM 
          k="gov_dp_text"
          args={{
            ...current_dp_counts_with_generic_keys, 
            depts_with_dps: counts_by_dept.length,
            year: current_dp_year,
            drr_tabling_year: current_dp_corresponding_drr_year,
          }}
        />
      </div>
      <HorizontalStatusTable 
        counts_by_dept={counts_by_dept}
        gov_counts={verbose_gov_counts}
        status_columns={{
          [`${current_dp_key}_results`]: text_maker("results"),
          [`${current_dp_key}_indicators`]: text_maker("indicators"),
        }}
        doc={current_dp_key}
      />
    </Fragment>
  );
};
  

export const declare_gov_dp_panel = () => declare_panel({
  panel_key: "gov_dp",
  levels: ["gov"],
  panel_config_func: (level, panel_key) => ({
    requires_result_counts: true,
    calculate: () => {
      const verbose_gov_counts = ResultCounts.get_gov_counts();
      
      const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row[`${current_dp_key}_results`] > 0 );
      const counts_by_dept = _.chain(dept_counts)
        .map( row => ({ 
          subject: Dept.lookup(row.id),
          counts: row,
        }))
        .map( obj => ({...obj, total: d3.sum(_.values(obj.counts)) } ) )
        .value();
  
      return { 
        verbose_gov_counts,
        counts_by_dept,
      };
    },
    footnotes: ["DP_RESULTS"],
    source: (subject) => get_source_links(["DP"]),
    render({ calculations, sources, footnotes}){
      const {
        panel_args: {
          verbose_gov_counts,
          counts_by_dept,
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
            verbose_gov_counts={verbose_gov_counts}
            counts_by_dept={counts_by_dept}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
