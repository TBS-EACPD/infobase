export { declare_simplographic_panel } from './simplographic.js';
export { declare_gov_related_info_panel } from './gov_related.js';
export { declare_links_to_rpb_panel } from './rpb_links.js';
export { declare_m2m_warning_panel } from './tag_intro_panels.js';
export {
  declare_year_warning_panel,
  declare_dead_program_warning_panel,
  declare_dead_crso_warning_panel,
} from './meta_panels.js';
export {
  declare_portfolio_structure_intro_panel,
  declare_portfolio_structure_related_panel,
  declare_program_fed_structure_panel,
  declare_related_program_structure_panel,
  declare_tag_fed_structure_panel,
  declare_sibling_tags_panel,
  declare_crso_in_gov_panel,
  declare_crso_links_to_other_crso_panel,
} from './hierarchy_panels.js';
export { 
  declare_tags_of_interest_panel,
  declare_tag_progs_by_dept_panel,
  declare_related_tags_panel,
} from './tags_related_to_subject_panels.js';
export {
  declare_profile_panel,
  declare_description_panel,
} from './profile_panels.js';
export {
  declare_financial_key_concepts_panel,
  declare_results_key_concepts_panel,
  declare_people_key_concepts_panel,
  declare_tagging_key_concepts_panel,
} from './key_concept_panels/key_concept_panels.js';


import { declare_panel, util_components, Subject } from '../shared.js';
import { TM } from './intro_panel_text_provider.js';

const { Dept } = Subject;

const {
  AlertBanner,
} = util_components;


const late_dp_departments = [];
export const declare_late_dps_warning_panel = () => declare_panel({
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
          render({ calculations: { panel_args: late_dp_department_names } }) {
            return (
              <AlertBanner additional_class_names={'large_panel_text'}>
                <TM k="late_dps_warning_gov" args={{late_dp_department_names}}/>
              </AlertBanner>
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
              <AlertBanner additional_class_names={'large_panel_text'}>
                <TM k={`late_dps_warning_${level}`} />
              </AlertBanner>
            );
          },
        };
    }
  },
});
