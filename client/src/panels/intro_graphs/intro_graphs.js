import { PanelGraph, util_components, Subject } from '../shared';
import { text_maker, TM } from './intro_graph_text_provider.js';
import './simplographic.js';
import './gov_related.js';
import './rpb_links.js';
import './tag_intro_graphs.js';
import './program_meta_graphs.js';
import './hierarchy_panels.js';
import './tags_related_to_subject_panels.js';
import './profile_panels.js';
import MediaQuery from 'react-responsive';
import classNames from 'classnames';

const { Dept } = Subject;

const {
  AutoAccordion,
  KeyConceptList,
} = util_components;

const curried_render = ({ q_a_keys, omit_name_item }) => function ({ calculations: { subject } }) {
  let rendered_q_a_keys = _.clone(q_a_keys);
  if (!omit_name_item) {
    if (shouldAddOrgNameItem(subject)) {
      rendered_q_a_keys.unshift('applied_title');
    } else {
      rendered_q_a_keys.push('different_org_names_static');
    }
  }

  if (subject.level === 'crso') {
    if (subject.is_cr) {
      rendered_q_a_keys = ['what_are_CR', ...rendered_q_a_keys];
    } else {
      rendered_q_a_keys = ['what_are_SOut', ...rendered_q_a_keys];
    }
  }

  return <MediaQuery maxWidth={991}>
    {(matches) => <div className={classNames("mrgn-bttm-md", matches && "mrgn-tp-md")}>
      <AutoAccordion title={text_maker("some_things_to_keep_in_mind")}>
        <div style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          <KeyConceptList
            question_answer_pairs={
              _.map(
                rendered_q_a_keys,
                key => [
                  <TM key={key + "_q"} k={key + "_q"} args={{ subject }} />,
                  <TM key={key + "_a"} k={key + "_a"} args={{ subject }} />,
                ]
              )
            }
          />
        </div>
      </AutoAccordion>
    </div>
    }
  </MediaQuery>
};

const shouldAddOrgNameItem = subject => subject.is('dept') && subject.applied_title && subject.name !== subject.applied_title;

_.each(['gov', 'dept', 'program', 'tag', 'crso'], lvl => {
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    key: 'financial_intro',
    info_deps: [],
    source: false,
    calculate: _.constant(true),

    render: curried_render({
      q_a_keys: [
        'where_does_authority_come_from',
        'what_are_mains',
        'what_are_supps',
        'what_are_exps',
        'what_is_fy',
        'why_cant_i_see_prov_spend',
        'what_spending_is_included',
      ],
    }),
  });
});

_.each(['gov', 'dept', 'program', 'crso'], lvl => {
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    key: 'results_intro',
    info_deps: [],
    source: false,
    calculate: _.constant(true),
    render: curried_render({
      q_a_keys: [
        'what_is_policy_on_results',
        'what_is_diff_with_mrrs',
        'what_is_a_drf',
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
    key: 'people_intro',
    info_deps: [],
    source: false,
    calculate: _.constant(true),

    render: curried_render({
      q_a_keys: [
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
  key: 'tagging_key_concepts',
  info_deps: [],
  source: false,
  calculate: _.constant(true),

  render: curried_render({
    q_a_keys: [
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
    key: "march_snapshot_warning",
    calculate: _.constant(true),

    render() {
      return (
        <div className="alert alert-info alert-no-symbol alert--is-bordered large_panel_text">
          <TM k="march_snapshot_warning" />
        </div>
      );
    },
  });

  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    source: false,
    info_deps: [],
    key: "ppl_open_data_info",
    calculate: _.constant(true),
    render: () => (
      <div className="alert alert-info alert-no-symbol alert--is-bordered large_panel_text">
        <TM k="ppl_open_data_info" />
      </div>
    ),
  });
});


const late_dp_departments = [
  128, // Employment and Social Development Canada
  237, // Infrastructure Canada
  350, // Leaders’ Debates Commission
  302, // Security Intelligence Review Committee
];
_.each(['dept','crso','program'], lvl => {
  new PanelGraph({
    level: lvl,
    static: true,
    footnotes: false,
    source: false,
    info_deps: [],
    key: "late_dps_warning",
    calculate: (subject) => _.includes(
      late_dp_departments, 
      lvl === 'dept' ?
        subject.id :
        subject.dept.id
    ),
    render() {
      return (
        <div className="alert alert-info alert-no-symbol alert--is-bordered large_panel_text">
          <TM k={`late_dps_warning_${lvl}`} />
        </div>
      );
    },
  });
});
new PanelGraph({
  level: "gov",
  static: true,
  footnotes: false,
  source: false,
  info_deps: [],
  key: "late_dps_warning",
  calculate: () => !_.isEmpty(late_dp_departments) && {
    late_dp_department_names: _.map(
      late_dp_departments,
      (org_id) => Dept.lookup(org_id).fancy_name
    ),
  },
  render({ calculations: { graph_args: late_dp_department_names } }) {
    return (
      <div className="alert alert-info alert-no-symbol alert--is-bordered large_panel_text">
        <TM k="late_dps_warning_gov" args={{late_dp_department_names}}/>
      </div>
    );
  },
});