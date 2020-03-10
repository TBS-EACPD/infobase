import text from './warning_panels.yaml'; 

import { Fragment } from 'react';

import dynamic_footnote_text from '../../../models/footnotes/dynamic_footnotes.yaml';
import { docs_with_late_planned_spending } from '../../../models/footnotes/dynamic_footnotes.yaml';

import {
  util_components,
  Subject,
  Results,
  create_text_maker_component,

  declare_panel,
} from "../shared.js";

const { TM, text_maker} = create_text_maker_component([text, dynamic_footnote_text]);
const { Dept } = Subject;
const { result_docs_in_tabling_order } = Results;
const { AlertBanner, KeyConceptList, MultiColumnList } = util_components;


const WarningPanel = ({banner_class = 'info', center_text = true, children}) => (
  <AlertBanner
    banner_class={banner_class}
    additional_class_names='large_panel_text'
    style={center_text ? {textAlign: "center"} : {}}
  >
    {children}
  </AlertBanner>
);


export const declare_dead_program_warning_panel = () => declare_panel({
  panel_key: "dead_program_warning",
  levels: ['program'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: _.property("is_dead"),
    render(){
      return (
        <WarningPanel banner_class="danger">
          <TM k="dead_program_warning" />
        </WarningPanel>
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
        <WarningPanel banner_class="danger">
          <TM k="dead_crso_warning" />
        </WarningPanel>
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
      <WarningPanel center_text={false}>
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
      </WarningPanel>
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
            <WarningPanel key={ix}>
              {per_doc_inner_content(result_doc)}
            </WarningPanel>
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
            const per_doc_inner_content = (result_doc) => (
              <div style={{textAlign: "left"}}>
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
              </div>
            );

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
            const per_doc_inner_content = (result_doc) => (
              <TM
                k={`late_results_warning_${level}`}
                args={{
                  result_doc_name: text_maker(`${result_doc.doc_type}_name`, {year: result_doc.year}),
                }}
              />
            );
            
            return get_per_doc_late_results_alert(per_doc_inner_content);
          },
        };
    }
  },
});


export const declare_late_planned_spending_panel = () => declare_panel({
  panel_key: 'late_planned_spending_warning',
  levels: ['gov', 'dept', 'crso', 'program'],
  panel_config_func: (level, panel_key) => {
    switch (level){
      case "gov":
        return {
          static: true,
          footnotes: false,
          source: false,
          info_deps: [],
          calculate: () => !_.isEmpty(docs_with_late_planned_spending),
          render: () => (
            <WarningPanel center_text={false}>
              <TM k={'late_planned_spending_warning_gov'} />
              <MultiColumnList
                list_items={_.map(
                  docs_with_late_planned_spending, 
                  (org_id) => Dept.lookup(org_id).fancy_name
                )}
                column_count={ window.lang === "en" && docs_with_late_planned_spending.length > 3 ? 2 : 1 }
                li_class={ docs_with_late_planned_spending.length > 4 ? "font-small" : '' }
              />
            </WarningPanel>
          ),
        };
      default:
        return {
          static: true,
          footnotes: false,
          source: false,
          info_deps: [],
          calculate: (subject) => _.includes(
            docs_with_late_planned_spending,
            level === 'dept' ?
              subject.id :
              subject.dept.id
          ),
          render: () => (
            <WarningPanel>
              <TM k={`late_planned_spending_warning_${level}`} />
            </WarningPanel>
          ),
        };
    }
  },
});