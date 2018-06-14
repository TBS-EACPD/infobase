const text = require('./igoc_panel.yaml');

const {
  create_text_maker,
  PanelGraph,
  util_components: {
    TM: StdTM,
  },
  TextPanel,
} = require("../shared"); 

const tmf = create_text_maker(text);
const TM = props => <StdTM tmf={tmf} {...props} />;


new PanelGraph({
  level: 'dept',
  title: "org_profile",
  key : "igoc_fields",
  calculate: _.constant(true),
  render({calculations}){
    const { subject } = calculations;

    return (
      <TextPanel title={tmf("org_profile")}>
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
        title={tmf("org_links")}
      >
        <TM k="igoc_links_t" args={{ org: subject }} />
      </TextPanel>
    )
  },
});
