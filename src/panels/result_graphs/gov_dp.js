import text from './gov_dp_text.yaml';

import {
  create_text_maker,
  PanelGraph,
  Panel,
  TM as StdTM,
} from "../shared";


import { ResultCounts } from './results_common.js';


const text_maker = create_text_maker(text);
const TM = props => <StdTM tmf={text_maker} {...props} />;

const ResultsIntroPanel = ({counts}) => (
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
            src={`./png/result-taxonomy-${window.lang}.png`} 
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
  

new PanelGraph({
  level: 'gov',
  requires_result_counts: true,
  key: "gov_dp",
  calculate: _.constant(true),
  footnotes: false,
  render(panel, calculations){
    const counts = ResultCounts.get_gov_counts();
    return (
      <Panel
        title={text_maker("gov_dp_summary_title")}
      >
        <ResultsIntroPanel 
          counts={counts}
        />
      </Panel>
    ); 
  },
});