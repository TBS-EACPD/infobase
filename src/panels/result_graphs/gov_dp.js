import { get_static_url } from '../../core/request_utils';
import {Fragment} from 'react';
import text from './gov_dp_text.yaml';

import {
  create_text_maker_component,
  PanelGraph,
  Panel,
  rpb_link,
  infograph_href_template,
} from "../shared";

import { DeptSearch } from '../../util_components.js';


import { ResultCounts } from './results_common.js';

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

const ResultsIntroPanel = ({counts}) => <Fragment>
  <div className="frow middle-xs">
    <div className="fcol-md-7 medium_panel_text">
      <TM k="gov_dp_text" args={counts} />
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
  {!window.is_a11y_mode && 
    <div
      style={{
        padding: "0 100px",
        margin: "40px auto",
      }}
    >
      <div className="medium_panel_text">
        <TM k="gov_dp_above_search_bar_text" />
      </div>
      <div>
        <DeptSearch
          only_include_dp
          href_template={ subj => infograph_href_template(subj, "results", true) }
          placeholder={text_maker("gov_dp_search_bar_placeholder")}
        />
      </div>
    </div>
  }
</Fragment>;
  

new PanelGraph({
  level: 'gov',
  requires_result_counts: true,
  key: "gov_dp",
  calculate: _.constant(true),
  footnotes: false,
  render(panel, calculations){
    const counts = ResultCounts.get_gov_counts();
    const { spend, ftes } = get_dp_rpb_links();
    return (
      <Panel
        title={text_maker("gov_dp_summary_title")}
        allowOverflow
      >
        <ResultsIntroPanel 
          counts={counts}
          spend_link={spend}
          fte_link={ftes}
        />
      </Panel>
    ); 
  },
});