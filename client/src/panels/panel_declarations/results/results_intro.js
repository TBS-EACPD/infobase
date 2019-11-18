import './results.scss';

import classNames from 'classnames';
import { Fragment } from 'react';
import {
  declare_panel,
  declarative_charts,
  InfographicPanel,
  businessConstants,
  get_source_links,
  create_text_maker_component,
} from "../shared.js";
import text from './results_intro_text.yaml';
import { get_static_url } from '../../../request_utils.js';
import { 
  ResultCounts,
  GranularResultCounts,
  row_to_drr_status_counts,
  get_result_doc_keys,
} from './results_common.js';

const { text_maker, TM } = create_text_maker_component(text);


const latest_drr_doc_key = _.last( get_result_doc_keys("drr") );
const latest_dp_doc_key = _.last( get_result_doc_keys("dp") );

const ResultsIntroPanel = ({subject, counts, verbose_gov_counts}) => {
  const dp_summary_text_args = {subject, counts, verbose_gov_counts};
  const drr_summary_text_args = {subject, counts, verbose_gov_counts};
  return (
    <div className="frow middle-xs">
      <div className="fcol-md-7 medium_panel_text">
        <TM k="results_intro_text" />
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
      <div className="fcol-md-12 medium_panel_text">
        <TM k="dp_summary_text" args={dp_summary_text_args} />
        <TM k="drr_summary_text" args={drr_summary_text_args} />
      </div>
    </div>
  );
};

export const declare_results_intro_panel = () => declare_panel({
  panel_key: "results_intro",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
    requires_result_counts: level === "dept",
    require_granular_result_counts: level !== "dept",
    footnotes: ["RESULTS_COUNTS", "RESULTS"],
    source: (subject) => get_source_links(["DRR"]),
    calculate: (subject) => {
      const verbose_counts = (() => {
        switch (level){
          case 'dept':
            return ResultCounts.get_dept_counts(subject.id);
          case 'gov':
            return ResultCounts.get_gov_counts();
        }
      })();

      const counts = row_to_drr_status_counts(verbose_counts, latest_drr_doc_key);
    
      if(verbose_counts[`${latest_drr_doc_key}_total`] < 1){
        return false;
      }
    
      return {
        subject,
        verbose_counts,
        counts,
      };
    },
    render({ calculations, sources}){
      const {
        subject,
        verbose_counts,
        counts,
      } = calculations;
  
      return (
        <InfographicPanel
          title={"OMG WTF LOL"}
          sources={sources}
          allowOverflow
        >
          <ResultsIntroPanel
            subject={subject}
            {...{verbose_counts, counts}}
          />
        </InfographicPanel>
      ); 
    },
  }),
});