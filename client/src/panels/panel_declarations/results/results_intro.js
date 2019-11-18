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

const { text_maker, TM } = create_text_maker_component(text);

const ResultsIntroPanel = ({counts, verbose_gov_counts, counts_by_dept}) => {
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
    </div>
  );
};

export const declare_results_intro_panel = () => declare_panel({
  panel_key: "results_intro",
  levels: ["gov", "dept", "crso", "program"],
  panel_config_func: (level, panel_key) => ({
    requires_result_counts: level === "dept",
    require_granular_result_counts: level !== "dept",
    footnotes: ["RESULTS_COUNTS", "RESULTS"],
    source: (subject) => get_source_links(["DRR"]),
    calculate: () => { return {}; },
    render({ calculations, sources}){
      // const {
      //   graph_args: {
      //     verbose_gov_counts,
      //     counts_by_dept,
      //   },
      // } = calculations;
  
      return (
        <InfographicPanel
          title={"OMG WTF LOL"}
          sources={sources}
          allowOverflow
        >
          <ResultsIntroPanel/>
        </InfographicPanel>
      ); 
    },
  }),
});