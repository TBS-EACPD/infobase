import text from './warning_panels.yaml'; 

import { Fragment } from 'react';

import {
  actual_to_planned_gap_year,
  util_components,
  Subject,
  Results,
  create_text_maker_component,

  declare_panel,
} from "../shared.js";

const { TM, text_maker} = create_text_maker_component([text]);
const { Dept } = Subject;
const { result_docs_in_tabling_order } = Results;
const { AlertBanner, KeyConceptList, MultiColumnList } = util_components;

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


export const declare_late_results_warning_panel = () => declare_panel({
  panel_key: 'late_results_warning',
  levels: ['gov', 'dept', 'crso', 'program'],
  panel_config_func: (level, panel_key) => {
    const docs_with_late_departments = _.chain(result_docs_in_tabling_order)
      .reverse()
      .filter(({late_departments}) => late_departments.length > 0)
      .value();

    const get_per_doc_late_results_alert = (per_doc_inner_content) => (
      <Fragment>
        {_.map(
          docs_with_late_departments,
          (result_doc, ix) => (
            <AlertBanner key={ix} additional_class_names={'large_panel_text'}>
              {per_doc_inner_content(result_doc)}
            </AlertBanner>
          )
        )}
      </Fragment>
    );

    switch (level){
      case "gov":
        return {
          static: true,
          footnotes: false,
          source: false,
          info_deps: [],
          calculate: () => !_.isEmpty(docs_with_late_departments),
          render(){
            const per_doc_inner_content = (result_doc) => <Fragment>
              <TM
                k={'late_results_warning_gov'}
                args={{
                  result_doc_name: text_maker(`${result_doc.doc_type}_name`, {year: result_doc.year}),
                }}
              />
              <MultiColumnList
                list_items={_.map(
                  result_doc.late_departments, 
                  (org_id) => Dept.lookup(org_id).fancy_name
                )}
                column_count={ window.lang === "en" && result_doc.late_departments.length > 3 ? 2 : 1 }
                li_class={ result_doc.late_departments.length > 4 ? "font-small" : '' }
              />
            </Fragment>;

            return get_per_doc_late_results_alert(per_doc_inner_content);
          },
        };
      default:
        return {
          static: true,
          footnotes: false,
          source: false,
          info_deps: [],
          calculate: (subject) => _.chain(docs_with_late_departments)
            .flatMap('late_departments')
            .includes(
              level === 'dept' ?
                subject.id :
                subject.dept.id
            )
            .value(),
          render(){
            const per_doc_inner_content = (result_doc) => <TM
              k={`late_results_warning_${level}`}
              args={{
                result_doc_name: text_maker(`${result_doc.doc_type}_name`, {year: result_doc.year}),
              }}
            />;
            
            return get_per_doc_late_results_alert(per_doc_inner_content);
          },
        };
    }
  },
});