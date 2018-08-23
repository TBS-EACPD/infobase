import text from './igoc_panel.yaml';
import { 
  PanelGraph, 
  util_components, 
  TextPanel,
} from '../shared';

const { create_text_maker_component } = util_components;

const { text_maker, TM } = create_text_maker_component(text);

new PanelGraph({
  level: 'dept',
  title: "org_profile",
  key : "igoc_fields",
  calculate: _.constant(true),
  render({calculations}){
    const { subject } = calculations;

    return (
      <TextPanel title={text_maker("org_profile")}>
        <TM 
          k="igoc_data_t"
          args={{ 
            org: subject,
            show_all_fields: subject.status === 'Active',
          }} 
        />
      </TextPanel>
    );
  },
});


new PanelGraph({
  level: 'dept',
  key : "igoc_links",
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

  render({calculations}){
    const { subject } = calculations;

    return (
      <TextPanel
        title={text_maker("org_links")}
      >
        <TM k="igoc_links_t" args={{ org: subject }} />
      </TextPanel>
    )
  },
});
