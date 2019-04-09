import { get_static_url } from '../../request_utils.js';
import {Fragment} from 'react';
import text from './gov_dp_text.yaml';

import {
  create_text_maker_component,
  PanelGraph,
  Panel,
  rpb_link,
  infograph_href_template,
  get_source_links,
} from "../shared";

import { DeptSearch } from '../../util_components.js';


import {
  ResultCounts,
  result_docs,
} from './results_common.js';

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

const ResultsIntroPanel = ({counts, depts_with_dps}) => <Fragment>
  <div className="frow middle-xs">
    <div className="fcol-md-7 medium_panel_text">
      <TM k="gov_dp_text" args={{...counts, depts_with_dps}} />
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
  calculate: () => {
    const latests_dp_doc = _.chain(result_docs)
      .keys()
      .filter( doc_key => /dp/.test(doc_key) )
      .last()
      .value();

    const depts_with_dps = _.filter( 
      ResultCounts.get_all_dept_counts(),
      counts => counts[`${latests_dp_doc}_results`]
    ).length;

    return { depts_with_dps };
  },
  footnotes: false,
  source: (subject) => get_source_links(["DP"]),
  render({ calculations, sources}){
    const {
      graph_args: {
        depts_with_dps,
      },
    } = calculations;
    const counts = ResultCounts.get_gov_counts();
    const { spend, ftes } = get_dp_rpb_links();

    return (
      <Panel
        title={text_maker("gov_dp_summary_title")}
        sources={sources}
        allowOverflow
      >
        <ResultsIntroPanel 
          counts={counts}
          depts_with_dps={depts_with_dps}
          spend_link={spend}
          fte_link={ftes}
        />
      </Panel>
    ); 
  },
});