const {
  PanelGraph,
  reactAdapter,
} = require("../shared"); 


const title_keys = {
  tag: 'tag_desc_title',
  crso: 'crso_desc_title',
  program: 'program_desc_title',
};

_.each(['tag','crso','program'], level => {
  new PanelGraph({
    level,
    key : "description",
    layout : {
      full : { graph : [12]},
      half : { graph : [12]},
    },
    footnotes: false,
    title: title_keys[level],
    calculate: subject => _.nonEmpty(subject.description),
    render(panel,calculations){
      
      const {subject} = calculations;
      
      const view = <div className="medium_panel_text">
        <p> {subject.description} </p>
      </div>;

      reactAdapter.render(
        view, 
        panel.areas().graph.node() 
      );
    },
  });
});
