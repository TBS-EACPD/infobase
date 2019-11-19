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
  result_docs,
} from './results_common.js';

const { text_maker, TM } = create_text_maker_component(text);


const latest_drr_doc_key = _.last( get_result_doc_keys("drr") );
const latest_dp_doc_key = _.last( get_result_doc_keys("dp") );

const ResultsIntroPanel = ({subject, summary_counts, doc_urls}) => {
  const summary_text_args = {subject, ...summary_counts};
  
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
        <TM k="dp_summary_text" args={summary_text_args} />
        <TM k="drr_summary_text" args={summary_text_args} />
        {summary_counts.drr_results > 0 && <TM k="reports_links_text" args={doc_urls} />}
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

      if(verbose_counts[`${latest_dp_doc_key}_results`] < 1){
        return false;
      }

      const summary_counts = {
        dp_results: verbose_counts[`${latest_dp_doc_key}_results`],
        dp_indicators: verbose_counts[`${latest_dp_doc_key}_indicators`],
        drr_results: verbose_counts[`${latest_drr_doc_key}_results`],
        drr_indicators: verbose_counts[`${latest_drr_doc_key}_total`],
      };

      const doc_urls = {
        dp_url: result_docs[latest_dp_doc_key][`doc_url_${window.lang}`],
        drr_url: result_docs[latest_drr_doc_key][`doc_url_${window.lang}`],
      };

      return {
        subject,
        summary_counts,
        doc_urls,
      };
    },
    render({ calculations, sources}){
      const {
        subject,
        panel_args,
      } = calculations;
  
      return (
        <InfographicPanel
          title={text_maker("results_intro_title")}
          sources={sources}
        >
          <ResultsIntroPanel
            subject={subject}
            {...panel_args}
          />
        </InfographicPanel>
      ); 
    },
  }),
});