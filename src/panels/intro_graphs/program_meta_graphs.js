const {
  text_maker,
  PanelGraph,
} = require("../shared"); 

new PanelGraph({
  is_old_api: true,
  level: 'program',
  key : "dead_program_warning",
  title: "dead_program_warning_title",
  text: "dead_program_warning_text",

  layout : {
    full :{ text: [12] },
    half : { text : [12] },
  },

  footnotes: false,

  calculate(subject){
    return subject.dead_program;
  },

  render(panel){
    const sel = panel.el;
    sel.attr('class', "");
    sel.html(`
      <div 
        class="alert alert-danger alert--is-bordered large_panel_text"
        style="text-align:center"
      >
        ${text_maker("dead_program_warning")}
      </div>
    `);
  },
});

new PanelGraph({
  is_old_api: true,
  level: 'crso',
  key : "dead_crso_warning",
  title: "dead_crso_warning_title",

  // text: "dead_crso_warning_text",

  layout : {
    full :{ text: [12] },
    half : { text : [12] },
  },

  footnotes: false,

  calculate(subject){
    return subject.dead_so;
  },

  render(panel, info){
    const sel = panel.el;
    sel.attr('class', "");
    sel.html(`
      <div 
        class="alert alert-danger alert--is-bordered large_panel_text"
        style="text-align:center"
      >
        ${text_maker("dead_crso_warning")}
      </div>
    `);
  },
});