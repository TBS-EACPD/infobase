import './results.scss';

import classNames from 'classnames';
import { Fragment } from 'react';
import {
  declare_panel,
  declarative_charts,
  InfographicPanel,
  businessConstants,
  get_source_links,
} from "../shared.js";

const NewResultsIntroPanel = () => {}

export const declare_drr_summary_panel = () => declare_panel({
  panel_key: "drr_summary",
  levels: ["dept", "crso", "program"],
  panel_config_func: (level, panel_key) => ({
    requires_result_counts: level === "dept",
    require_granular_result_counts: level !== "dept",
    footnotes: ["RESULTS_COUNTS", "RESULTS"],
    source: (subject) => get_source_links(["DRR"]),
    calculate: () => { return {}; },
    render({ calculations, sources}){
      const {
        graph_args: {
          verbose_gov_counts,
          counts_by_dept,
        },
      } = calculations;
  
      return (
        <InfographicPanel
          title={"OMG WTF LOL"}
          sources={sources}
          allowOverflow
        >
          <NewResultsIntroPanel/>
        </InfographicPanel>
      ); 
    },
  }),
});