import { get_static_url } from '../../../request_utils.js';
import {Fragment} from 'react';
import text from './gov_dp_text.yaml';

import {
  Subject,
  create_text_maker_component,
  declare_panel,
  InfographicPanel,
  rpb_link,
  get_source_links,
} from "../shared.js";

import {
  ResultCounts,
  get_result_doc_keys,
  current_dp_key,
  filter_and_genericize_doc_counts,
} from './results_common.js';
import { HorizontalStatusTable } from './result_components.js';

const { Dept } = Subject;

const get_dp_rpb_links = () => ({
  spend: rpb_link({
    table: "programSpending",
    columns: ['{{planning_year_1}}','{{planning_year_2}}','{{planning_year_3}}'], 
    mode: "details",
    
  }),
  ftes: rpb_link({
    table: "programFtes",
    columns: ['{{planning_year_1}}','{{planning_year_2}}','{{planning_year_3}}'], 
    mode: "details",
  }),
});

const { text_maker, TM } = create_text_maker_component(text);

const latest_dp_doc_key = _.last( get_result_doc_keys('dp') );

const ResultsIntroPanel = ({counts, verbose_gov_counts, counts_by_dept}) => {
  const current_dp_counts_with_generic_keys = filter_and_genericize_doc_counts(counts, current_dp_key);

  return (
    <Fragment>
      <div className="frow middle-xs">
        <div className="fcol-md-7 medium_panel_text">
          <TM k="gov_dp_text" args={{...current_dp_counts_with_generic_keys, depts_with_dps: counts_by_dept.length}} />
        </div>
        {!window.is_a11y_mode &&
          <div className="fcol-md-5">
            <div
              style={{
                padding: "20px",
              }}
            >
              <img
                src={get_static_url(`png/result-taxonomy-${window.lang}.png`)} 
                style={{
                  width: "100%",
                  maxHeight: "500px",
                }}
              />
            </div>
          </div>
        }
      </div>
      <HorizontalStatusTable 
        counts_by_dept={counts_by_dept}
        gov_counts={verbose_gov_counts}
        status_columns={{
          [`${latest_dp_doc_key}_results`]: text_maker("results"),
          [`${latest_dp_doc_key}_indicators`]: text_maker("indicators"),
        }}
        doc={latest_dp_doc_key}
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
      
      const dept_counts = _.filter(ResultCounts.get_all_dept_counts(), row => row[`${latest_dp_doc_key}_results`] > 0 );
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
    footnotes: false,
    source: (subject) => get_source_links(["DP"]),
    render({ calculations, sources}){
      const {
        panel_args: {
          verbose_gov_counts,
          counts_by_dept,
        },
      } = calculations;
      const counts = ResultCounts.get_gov_counts();
      const { spend, ftes } = get_dp_rpb_links();
  
      return (
        <InfographicPanel
          title={text_maker("gov_dp_summary_title")}
          sources={sources}
          allowOverflow
        >
          <ResultsIntroPanel 
            counts={counts}
            verbose_gov_counts={verbose_gov_counts}
            counts_by_dept={counts_by_dept}
            spend_link={spend}
            fte_link={ftes}
          />
        </InfographicPanel>
      ); 
    },
  }),
});
