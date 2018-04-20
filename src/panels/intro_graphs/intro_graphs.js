const {
  text_maker,
  PanelGraph,
  reactAdapter,
  util_components: {
    TextMaker,
    AutoAccordion,
  },
} = require("../shared"); 


require("./intro_lang.ib.yaml");

require("./financial_intro.ib.yaml");
require("./people_intro.ib.yaml");
require("./results_intro.ib.yaml");
require("./tagging_intro.ib.yaml");

require('./simplographic.js');
require('./gov_related.js');
require('./rpb_links.js');
require('./tag_intro_graphs.js');
require('./program_meta_graphs.js');
require('./hierarchy_panels.js');
require('./tags_related_to_subject_panels.js');
require('./description_panels.js');


const KeyConceptList = ({ question_answer_keys, args }) => (
  <div>
    <div className="lg-grid">
      { _.map(question_answer_keys, key =>
        <div key={key} className="grid-row">
          <div className="lg-grid-panel30 key_concept_term"> <TextMaker text_key={key+"_q"} args={args}/> </div>
          <div className="lg-grid-panel70 key_concept_def"> <TextMaker text_key={key+"_a"} args={args}/> </div>
        </div>
      )}
    </div>
  </div>
);


const curried_render = ({q_a_keys, omit_name_item}) => function(panel,calcs){
  const { 
    subject,
  } = calcs;

  let rendered_q_a_keys = _.clone(q_a_keys);
  if(!omit_name_item){
    if(shouldAddOrgNameItem(subject)){
      rendered_q_a_keys.unshift('applied_title');
    } else {
      rendered_q_a_keys.push('different_org_names_static');
    }
  }

  if(subject.level === 'crso'){
    if(subject.is_cr){
      rendered_q_a_keys = [ 'what_are_CR', ...rendered_q_a_keys ];
    } else {
      rendered_q_a_keys = [ 'what_are_SOut', ...rendered_q_a_keys ];
    }
  }

  const view = <div className="mrgn-bttm-md">
    <AutoAccordion title={text_maker("some_things_to_keep_in_mind")}>
      <div style={{paddingLeft: '10px', paddingRight:'10px'}}>
        <KeyConceptList question_answer_keys={ rendered_q_a_keys } args={{subject}}/>
      </div>
    </AutoAccordion>
  </div>;


  const node = panel.el.node().parentNode;

  reactAdapter.render( view, node );

};

const shouldAddOrgNameItem = subject => subject.is('dept') && subject.applied_title && subject.name !== subject.applied_title;

_.each(['gov', 'dept', 'program', 'tag', 'crso'], lvl => {
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    key :  'financial_intro',
    layout: {
      half: { text: null, graph:12 },
      full: { text: null, graph: 12},
    },
    info_deps: [],
    source: false,
    title: 'some_things_to_keep_in_mind',
    calculate: _.constant(true),
    render: curried_render({ 
      q_a_keys : [ 
        'where_does_authority_come_from',
        'what_are_voted_auth',
        'what_are_stat_auth',
        'what_are_mains',
        'what_are_supps',
        'what_are_exps',
        'what_is_prog',
        'what_is_so',
        'what_is_fy',
        'what_are_ftes',
        'why_cant_i_see_prov_spend',
      ],
    }),
  });
});

_.each(['gov', 'dept', 'program', 'crso'], lvl => {
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    key :  'results_intro',
    layout: {
      half: { text: null, graph:12 },
      full: { text: null, graph: 12},
    },
    info_deps: [],
    source: false,
    title: 'some_things_to_keep_in_mind',
    calculate: _.constant(true),
    render: curried_render({
      q_a_keys: [
        'what_is_policy_on_results',
        'what_is_diff_with_mrrs',
        'which_orgs_policy_on_results',
        'what_is_a_drf',
        'what_is_a_cr',
        'what_is_prog', //notice this one is re-used from the financial defs
        'what_are_ftes',//notice this one is re-used from the financial defs
        'how_do_orgs_measure_perf',
        'what_are_DPs_and_DRRs',
      ],
    }),
  })

});


_.each(['gov', 'dept'], lvl => {
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    key :  'people_intro',
    layout: {
      half: { text: null, graph:12 },
      full: { text: null, graph: 12},
    },
    info_deps: [],
    source: false,
    title: 'some_things_to_keep_in_mind',
    calculate: _.constant(true),
    render: curried_render({ 
      q_a_keys : [
        'who_is_fps',
        'what_are_ftes',
        'what_are_headcounts',
        'what_are_emp_tenures',
        'what_ppl_are_included',
        'what_ppl_arent_included',
      ],
    }),
  });
});



new PanelGraph({
  level: 'tag',
  static: true,
  footnotes: false,
  key :  'tagging_key_concepts',
  layout: {
    half: { text: null, graph:12 },
    full: { text: null, graph: 12},
  },
  info_deps: [],
  source: false,
  title: 'some_things_to_keep_in_mind',
  calculate: _.constant(true),
  render: curried_render({ 
    q_a_keys : [
      'what_is_tagging',
      'what_is_prog_tagging',
      'what_tags_are_available',
      'what_are_how_we_help',
      'what_are_gocos',
    ],
    omit_name_item: true,
  }),
});


_.each(['gov', 'dept'], lvl => {
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    source: false,
    info_deps: [],
    key : "march_snapshot_warning",
    title: "march_snapshot_warning",
    text: "march_snapshot_warning",
  
    layout : {
      full :{ text: [12] },
      half : { text : [12] },
    },

    calculate: _.constant(true),
  
    render(panel){
      const sel = panel.el;
      sel.attr('class', "");
      sel.html(`
        <div 
          class="alert alert-warning alert--is-bordered large_panel_text"
          style="text-align:center"
        >
          ${text_maker("march_snapshot_warning")}
        </div>
      `);
    },
  });
  
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    source: false,
    info_deps: [],
    key : "ppl_open_data_info",
    title: "ppl_open_data_info",
    text: "ppl_open_data_info",
  
    layout : {
      full :{ text: [12] },
      half : { text : [12] },
    },

    calculate: _.constant(true),
  
    render(panel){
      const sel = panel.el;
      sel.attr('class', "");
      sel.html(`
        <div 
          class="alert alert-info alert-no-symbol alert--is-bordered large_panel_text"
          style="text-align:center"
        >
          ${text_maker("ppl_open_data_info")}
        </div>
      `);
    },
  });
});
