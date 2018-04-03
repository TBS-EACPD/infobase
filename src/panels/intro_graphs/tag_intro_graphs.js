const {
  PanelGraph,
} = require("../shared"); 

new PanelGraph({
  level: 'tag',
  key : "m2m_warning",

  layout : {
    full :{ text: [12] },
    half : { text : [12]},
  },

  footnotes: false,
  title: 'm2m_warning_title',
  text: 'm2m_warning_text',

  calculate(subject){
    //only display this warning
    return subject.root.id !== "GOCO";
  },

  render: _.noop,
});

