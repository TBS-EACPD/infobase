import text from './warning_panels.yaml'; 

import {
  actual_to_planned_gap_year,
  util_components,
  Subject,
  create_text_maker_component,

  declare_panel,
} from "../shared.js";

const { TM } = create_text_maker_component([text]);
const { Dept } = Subject;
const { AlertBanner, KeyConceptList } = util_components;

export const declare_dead_program_warning_panel = () => declare_panel({
  panel_key: "dead_program_warning",
  levels: ['program'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: _.property("is_dead"),
    render(){
      return (
        <AlertBanner
          banner_class="danger"
          additional_class_names={'large_panel_text'}
          style={{textAlign: "center"}}
        >
          <TM k="dead_program_warning" />
        </AlertBanner>
      );
    },
  }),
});


export const declare_dead_crso_warning_panel = () => declare_panel({
  panel_key: "dead_crso_warning",
  levels: ['crso'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: _.property("is_dead"),
    render(){
      
      return (
        <AlertBanner
          banner_class="danger"
          additional_class_names={'large_panel_text'}
          style={{textAlign: "center"}}
        >
          <TM k="dead_crso_warning" />
        </AlertBanner>
      );
    },
  }),
});


export const declare_gap_year_warning_panel = () => declare_panel({
  panel_key: "gap_year_warning",
  levels: ['gov','dept','crso','program'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: (subject, info, options) => {
      return !subject.is_dead && actual_to_planned_gap_year;
    },
    render({calculations}){
      return (
        <div 
          className="alert alert-info alert-no-symbol alert--is-bordered large_panel_text"
          style={{textAlign: "center"}}
        >
          <TM k="gap_year_warning" args={{gap_year: actual_to_planned_gap_year}}/>
        </div>
      );
    },
  }),
});


export const declare_m2m_tag_warning_panel = () => declare_panel({
  panel_key: "m2m_warning",
  levels: ['tag'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate(subject){
      return subject.is_m2m;
    },
  
    render: () => (
      <AlertBanner banner_class="danger">
        <KeyConceptList 
          question_answer_pairs={
            _.map( 
              [
                "MtoM_tag_warning_reporting_level",
                "MtoM_tag_warning_resource_splitting",
                "MtoM_tag_warning_double_counting",
              ], 
              key => [
                <TM key={key+"_q"} k={key+"_q"} />, 
                <TM key={key+"_a"} k={key+"_a"} />,
              ] 
            )
          }
        />
      </AlertBanner>
    ),
  }),
});


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