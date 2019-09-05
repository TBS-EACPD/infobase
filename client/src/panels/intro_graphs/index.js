import { declare_panel, util_components, Subject, breakpoints } from '../shared.js';
import { text_maker, TM } from './intro_graph_text_provider.js';
import { declare_simplographic_panel } from './simplographic.js';
import { declare_gov_related_info_panel } from './gov_related.js';
import { declare_links_to_rpb_panel } from './rpb_links.js';
import { declare_m2m_warning_panel } from './tag_intro_graphs.js';
import {
  declare_dead_program_warning_panel,
  declare_dead_crso_warning_panel,
} from './program_meta_graphs.js';
import {
  declare_portfolio_structure_intro_panel,
  declare_portfolio_structure_related_panel,
  declare_program_fed_structure_panel,
  declare_related_program_structure_panel,
  declare_tag_fed_structure_panel,
  declare_sibling_tags_panel,
  declare_crso_in_gov_panel,
  declare_crso_links_to_other_crso_panel,
} from './hierarchy_panels.js';
import { 
  declare_tags_of_interest_panel,
  declare_tag_progs_by_dept_panel,
  declare_related_tags_panel,
} from './tags_related_to_subject_panels.js';
import {
  declare_profile_panel,
  declare_description_panel,
} from './profile_panels.js';
import MediaQuery from 'react-responsive';
import classNames from 'classnames';

const { Dept } = Subject;

const {
  AutoAccordion,
  KeyConceptList,
} = util_components;

const shouldAddOrgNameItem = subject => subject.is('dept') && subject.applied_title && subject.name !== subject.applied_title;

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

  return <MediaQuery maxWidth={breakpoints.maxMediumDevice}>
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
  </MediaQuery>;
};


const declare_financial_intro_panel = () => declare_panel({
  panel_key: "financial_intro",
  levels: ['gov', 'dept', 'crso', 'program', 'tag'],
  panel_config_func: (level, panel_key) => ({
    static: true,
    footnotes: false,
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
  }),
});


const declare_results_intro_panel = () => declare_panel({
  panel_key: "results_intro",
  levels: ['gov', 'dept', 'crso', 'program'],
  panel_config_func: (level, panel_key) => ({
    static: true,
    footnotes: false,
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
  }),
});


const declare_people_intro_panel = () => declare_panel({
  panel_key: "people_intro",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => ({
    static: true,
    footnotes: false,
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
        'where_is_data',
      ],
    }),
  }),
});


const declare_tagging_key_concepts_panel = () => declare_panel({
  panel_key: "tagging_key_concepts",
  levels: ['tag'],
  panel_config_func: (level, panel_key) => ({
    static: true,
    footnotes: false,
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
  }),
});


const late_dp_departments = [];
const declare_late_dps_warning_panel = () => declare_panel({
  panel_key: "late_dps_warning",
  levels: ['gov', 'dept','crso','program'],
  panel_config_func: (level, panel_key) => {
    switch (level){
      case "gov":
        return {
          static: true,
          footnotes: false,
          source: false,
          info_deps: [],
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
        };
      default:
        return {
          static: true,
          footnotes: false,
          source: false,
          info_deps: [],
          calculate: (subject) => _.includes(
            late_dp_departments, 
            level === 'dept' ?
              subject.id :
              subject.dept.id
          ),
          render() {
            return (
              <div className="alert alert-info alert-no-symbol alert--is-bordered large_panel_text">
                <TM k={`late_dps_warning_${level}`} />
              </div>
            );
          },
        };
    }
  },
});


export {
  declare_simplographic_panel,

  declare_gov_related_info_panel,

  declare_links_to_rpb_panel,

  declare_m2m_warning_panel,

  declare_dead_program_warning_panel,
  declare_dead_crso_warning_panel,
  
  declare_portfolio_structure_intro_panel,
  declare_portfolio_structure_related_panel,
  declare_program_fed_structure_panel,
  declare_related_program_structure_panel,
  declare_tag_fed_structure_panel,
  declare_sibling_tags_panel,
  declare_crso_in_gov_panel,
  declare_crso_links_to_other_crso_panel,

  declare_tags_of_interest_panel,
  declare_tag_progs_by_dept_panel,
  declare_related_tags_panel,

  declare_profile_panel,
  declare_description_panel,

  declare_financial_intro_panel,
  declare_results_intro_panel,
  declare_people_intro_panel,
  declare_tagging_key_concepts_panel,
  declare_late_dps_warning_panel,
};