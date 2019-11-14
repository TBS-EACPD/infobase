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
