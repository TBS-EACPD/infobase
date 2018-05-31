const {
  PanelGraph,
  reactAdapter,
  util_components: {
    HeightClipper,
  },
  panel_components: {
    PanelText,
  },
} = require("../shared"); 

const {
  HierarchyPeek,
  org_external_hierarchy,
  org_internal_hierarchy,
  program_hierarchy,
  tag_hierarchy,
  crso_hierarchy,
  crso_pi_hierarchy,  
} = require('./hierarchy_component.js');

const { infograph_href_template } = require('../../link_utils.js');

const common_layout = {
  full: { graph: [12] },
  half: { graph: [12] },
};

new PanelGraph({
  is_old_api: true,
  level: 'dept',
  key : "portfolio_structure_intro",
  title: 'portfolio_structure_intro_title',
  layout : common_layout,
  footnotes: false,

  calculate(subject){
    return _.nonEmpty(subject.ministry)
  },

  render(panel,calculations){
    const { subject } = calculations;
    
    const view = <PanelText>
      <div className="medium_panel_text">
        <HeightClipper allowReclip={true} clipHeight={250}>
          <HierarchyPeek root={org_external_hierarchy({subject, href_generator: infograph_href_template})}/>
        </HeightClipper>
      </div>
    </PanelText>;


    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});


new PanelGraph({
  is_old_api: true,
  level: 'dept',
  key : "portfolio_structure_related",
  title : "portfolio_structure_related_title",
  layout : common_layout,
  footnotes: false,

  calculate(subject){
    return !_.isEmpty(subject.programs)
  },

  render(panel,calculations){
    const {subject } = calculations;

    const hierarchy_view = org_internal_hierarchy({
      subject, 
      href_generator: infograph_href_template,
      show_dead_sos: true,
    });

    const view = <PanelText>
      <div className="medium_panel_text">
        <HierarchyPeek root={hierarchy_view} />
      </div>
    </PanelText>;


    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

new PanelGraph({
  is_old_api: true,
  level: 'program',
  key : "program_fed_structure",
  layout : common_layout,
  footnotes: false,
  title: 'program_fed_structure_title',
  calculate: _.constant(true),

  render(panel,calculations){
    const { subject } = calculations;

    const hierarchy = program_hierarchy({
      subject,
      label_crsos: true,
      href_generator: infograph_href_template,
      show_siblings: false,
      show_cousins: false,
      show_uncles: false,
      show_dead_sos: false, 
    });
      
    const view = <div className="medium_panel_text">
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={hierarchy}/>
      </HeightClipper>
    </div>

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

new PanelGraph({
  is_old_api: true,
  level: 'program',
  key : "related_program_structure",
  layout : common_layout,
  title: "related_program_structure_title",
  footnotes: false,
  calculate: _.constant(true),

  render(panel,calculations){
    const { subject } = calculations;

    const hierarchy = program_hierarchy({
      subject,
      label_crsos: true,
      href_generator: infograph_href_template,
      show_siblings: true,
      show_cousins: true,
      show_uncles: true,
      show_dead_sos: true, 
    });
      
    const view = <div className="medium_panel_text">
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={hierarchy}/>
      </HeightClipper>
    </div>

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

new PanelGraph({
  is_old_api: true,
  level: 'tag',
  key : "tag_fed_structure",
  layout : common_layout,
  footnotes: false,
  title: 'tag_fed_structure_title',
  calculate: _.constant(true),

  render(panel,calculations){
    const { subject } = calculations;

    const hierarchy_structure = tag_hierarchy({
      subject,
      showSiblings: false,
      showChildren: false,
      href_generator: infograph_href_template,
    });

    const view = <div className="medium_panel_text">
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={ hierarchy_structure }/>
      </HeightClipper>
    </div>;

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

new PanelGraph({
  is_old_api: true,
  level: 'tag',
  key : "sibling_tags",
  layout : common_layout,
  footnotes: false,
  title: 'sibling_tags_title',
  calculate: _.constant(true),

  render(panel,calculations){
    const { subject } = calculations;

    const hierarchy_structure = tag_hierarchy({
      subject,
      showSiblings: true,
      showChildren: false,
      href_generator: infograph_href_template,
    });

    const view = <div className="medium_panel_text">
      <HeightClipper clipHeight={350} allowReclip={true}>
        <HierarchyPeek root={ hierarchy_structure }/>
      </HeightClipper>
    </div>;

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

new PanelGraph({
  is_old_api: true,
  level: 'crso',
  key : "crso_in_gov",
  title: "crso_in_gov_title",
  layout : common_layout,
  footnotes: false,
  calculate: _.constant(true),

  render(panel,calculations){
    const { subject } = calculations;

    const hierarchy = crso_pi_hierarchy({
      subject,
      label_crsos: true,
      href_generator: infograph_href_template,
    });
    
    const view = 
    <div className="medium_panel_text">
      <HierarchyPeek root={hierarchy}/>
    </div>

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});


new PanelGraph({
  is_old_api: true,
  level: 'crso',
  key : "crso_links_to_other_crso",
  title: "crso_links_to_other_crso_title",
  layout : common_layout,
  footnotes: false,
  calculate: _.constant(true),

  render(panel,calculations){
  
    const {subject} = calculations;

    const hierarchy = crso_hierarchy({
      subject,
      label_crsos: true,
      href_generator: infograph_href_template,
    });
    
    const view = <div className="medium_panel_text">
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={hierarchy}/>
      </HeightClipper>
    </div>

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});
