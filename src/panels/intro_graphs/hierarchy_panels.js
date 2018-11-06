import { text_maker } from './intro_graph_text_provider.js';
import { 
  PanelGraph, 
  util_components, 
  TextPanel, 
} from '../shared';
import { 
  HierarchyPeek, 
  org_external_hierarchy, 
  org_internal_hierarchy, 
  program_hierarchy, 
  tag_hierarchy, 
  crso_hierarchy, 
  crso_pi_hierarchy,
} from './hierarchy_component.js';
import { infograph_href_template } from '../../link_utils.js';

const { HeightClipper } = util_components;

new PanelGraph({
  level: 'dept',
  key: "portfolio_structure_intro",
  footnotes: false,

  calculate(subject){
    return _.nonEmpty(subject.ministry)
  },

  render({calculations}){
    const { subject } = calculations;

    return <TextPanel title={text_maker("portfolio_structure_intro_title")}>
      <HeightClipper allowReclip={true} clipHeight={250}>
        <HierarchyPeek root={org_external_hierarchy({subject, href_generator: infograph_href_template})}/>
      </HeightClipper>
    </TextPanel>;

  },
});


new PanelGraph({
  level: 'dept',
  key: "portfolio_structure_related",
  footnotes: false,

  calculate(subject){
    return !_.isEmpty(subject.programs)
  },

  render({calculations}){
    const {subject } = calculations;

    const hierarchy_view = org_internal_hierarchy({
      subject, 
      href_generator: infograph_href_template,
      show_dead_sos: true,
    });

    return (
      <TextPanel title={text_maker("portfolio_structure_related_title")}>
        <HierarchyPeek root={hierarchy_view} />
      </TextPanel>
    );

  },
});

new PanelGraph({
  level: 'program',
  key: "program_fed_structure",
  footnotes: false,
  calculate: _.constant(true),
  render({calculations}){
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
    
    return <TextPanel title={text_maker("program_fed_structure_title")}>
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={hierarchy}/>
      </HeightClipper>
    </TextPanel>

  },
});

new PanelGraph({
  level: 'program',
  key: "related_program_structure",
  footnotes: false,
  calculate: _.constant(true),

  render({calculations}){
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
      
    return <TextPanel title={text_maker("related_program_structure_title")}>
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={hierarchy}/>
      </HeightClipper>
    </TextPanel>;

  },
});

new PanelGraph({
  level: 'tag',
  key: "tag_fed_structure",
  footnotes: false,
  calculate: _.constant(true),

  render({calculations}){
    const { subject } = calculations;

    const hierarchy_structure = tag_hierarchy({
      subject,
      showSiblings: false,
      showChildren: false,
      href_generator: infograph_href_template,
    });

    return <TextPanel title={text_maker("tag_fed_structure_title")}>
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={ hierarchy_structure }/>
      </HeightClipper>
    </TextPanel>;
  },
});

new PanelGraph({
  level: 'tag',
  key: "sibling_tags",
  footnotes: false,
  calculate: _.constant(true),

  render({calculations}){
    const { subject } = calculations;

    const hierarchy_structure = tag_hierarchy({
      subject,
      showSiblings: true,
      showChildren: false,
      href_generator: infograph_href_template,
    });

    return <TextPanel title={text_maker("sibling_tags_title")}>
      <HeightClipper clipHeight={350} allowReclip={true}>
        <HierarchyPeek root={ hierarchy_structure }/>
      </HeightClipper>
    </TextPanel>;

  },
});

new PanelGraph({
  level: 'crso',
  key: "crso_in_gov",
  footnotes: false,
  calculate: _.constant(true),

  render({calculations}){
    const { subject } = calculations;

    const hierarchy = crso_pi_hierarchy({
      subject,
      label_crsos: true,
      href_generator: infograph_href_template,
    });
    
    return <TextPanel title={text_maker("crso_in_gov_title")}>
      <HierarchyPeek root={hierarchy}/>
    </TextPanel>

  },
});


new PanelGraph({
  level: 'crso',
  key: "crso_links_to_other_crso",
  footnotes: false,
  calculate: _.constant(true),

  render({calculations}){
  
    const {subject} = calculations;

    const hierarchy = crso_hierarchy({
      subject,
      label_crsos: true,
      href_generator: infograph_href_template,
    });
    
    return <TextPanel title={text_maker("crso_links_to_other_crso_title")}>
      <HeightClipper clipHeight={250} allowReclip={true}>
        <HierarchyPeek root={hierarchy}/>
      </HeightClipper>
    </TextPanel>

  },
});
