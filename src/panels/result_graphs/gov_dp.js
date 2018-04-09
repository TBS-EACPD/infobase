import './gov_dp_text.ib.yaml';

const {
  PanelGraph,
  reactAdapter,
  util_components: {
    TM,
  },
} = require("../shared");


const {
  ResultCounts,
} = require('./results_common.js');


const ResultsIntroPanel = ({counts}) => (
  <div className="frow middle-xs">
    <div className="fcol-md-7 medium_panel_text">
      <TM k="gov_dp_text" args={counts} />
    </div>
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
  </div>
);
  

new PanelGraph({
  level: 'gov',
  requires_result_counts: true,
  key: "gov_dp",
  layout: {
    full: {text: [], graph: 12},
    half : {text: [], graph: 12},
  },
  title : "gov_dp_summary_title",
  calculate: _.constant(true),
  footnotes: false,
  render(panel, calculations){
    const node = panel.areas().graph.node();
    const counts = ResultCounts.get_gov_counts();
    reactAdapter.render(
      <ResultsIntroPanel 
        counts={counts}
      />, 
      node
    );
  },
});
