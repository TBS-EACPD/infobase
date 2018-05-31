require('./igoc_panel.ib.yaml');

const {
  PanelGraph,
  reactAdapter,
  util_components: {
    TextMaker,
  },
  panel_components: {
    PanelText,
  },
} = require("../shared"); 


new PanelGraph({
  is_old_api: true,
  level: 'dept',
  title: "org_profile",
  key : "igoc_fields",

  layout : {
    full :{  graph : [12]},
    half : { graph : [12]},
  },

  calculate: _.constant(true),

  render(panel,calculations){
    const { subject } = calculations;

    const view = <PanelText>
      <div className="medium_panel_text" >
        <TextMaker 
          text_key="igoc_data_t" 
          args={{ 
            org: subject,
            show_all_fields: subject.status === 'Active',
          }} 
        />
      </div>
    </PanelText>

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});


new PanelGraph({
  is_old_api: true,
  level: 'dept',
  key : "igoc_links",
  title: "org_links",

  layout : {
    full :{  graph : [12]},
    half : { graph : [12]},
  },

  calculate(subject){
    if(subject.status !== 'Active'){
      return false;
    }
    return _.chain(subject)
      .pick([
        'eval_url',
        'qfr_url',
        'dp_url',
      ])
      .values()
      .some(url => _.nonEmpty(url))
      .value();
  },

  render(panel,calculations){
    const { subject } = calculations;

    const view = <PanelText>
      <div className="medium_panel_text" >
        <TextMaker text_key="igoc_links_t" args={{ org: subject }} />
      </div>
    </PanelText>

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});
