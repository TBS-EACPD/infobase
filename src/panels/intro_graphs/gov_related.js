require("./gov_related.ib.yaml");
const {  PanelGraph } = require("../shared");



new PanelGraph({
  level: 'gov',
  footnotes: false,
  key : "gov_related_info",
  depends_on : [ ],
  info_deps: [ ],
  title: 'gov_related_info_title',
  text: 'gov_related_info_text',

  layout : {
    full :{  text : [12]},
    half : { text : [12]},
  },

  calculate: _.constant(true),

  render(panel){
    panel.areas().text.style("line-height", "40px");
  },
});
