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


const gap_year_warning_calculate = (subject) => !subject.is_dead && actual_to_planned_gap_year;
const gap_year_warning_inner_render = () => <TM k="gap_year_warning" args={{gap_year: actual_to_planned_gap_year}}/>;
export const declare_gap_year_warning_panel = () => declare_panel({
  panel_key: "gap_year_warning",
  levels: ['gov','dept','crso','program'],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    calculate: gap_year_warning_calculate,
    render: () => (
      <WarningPanel>
        {gap_year_warning_inner_render(level)}
      </WarningPanel>
    ),
  }),
});


const docs_with_late_departments = _.chain(result_docs_in_tabling_order)
  .reverse()
  .filter(({late_departments}) => late_departments.length > 0)
  .value();
const late_results_warning_calculate = (subject) => {
  switch (subject.level){
    case "gov":
      return !_.isEmpty(docs_with_late_departments);
    default :
      return _.chain(docs_with_late_departments)
        .flatMap('late_departments')
        .includes(
          subject.level === 'dept' ?
            subject.id :
            subject.dept.id
        )
        .value();
  }
};
const late_results_warning_inner_render = (level) => {
  const per_doc_inner_content = (() => {
    switch (level){
      case "gov":
        return (result_doc) => (
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
      default :
        return (result_doc) => (
          <TM
            k={`late_results_warning_${level}`}
            args={{
              result_doc_name: text_maker(`${result_doc.doc_type}_name`, {year: result_doc.year}),
            }}
          />
        );
    }
  })();

  return _.map(
    docs_with_late_departments,
    (result_doc) => per_doc_inner_content(result_doc)
  );
};
export const declare_late_results_warning_panel = () => declare_panel({
  panel_key: 'late_results_warning',
  levels: ['gov', 'dept', 'crso', 'program'],
  panel_config_func: (level, panel_key) => ({
    static: true,
    footnotes: false,
    source: false,
    info_deps: [],
    calculate: late_results_warning_calculate,
    render: () => _.map(
      late_results_warning_inner_render(level),
      (inner_conent, ix) => (
        <WarningPanel key={ix} center_text={level !== 'gov'}>
          {inner_conent}
        </WarningPanel>
      )
    ),
  }),
});


const docs_with_late_planned_spending = [247, 347];
const late_planned_spending_calculate = (subject) => {
  switch (subject.level){
    case "gov":
      return !_.isEmpty(docs_with_late_planned_spending);
    default :
      return _.includes(
        docs_with_late_planned_spending,
        subject.level === 'dept' ?
          subject.id :
          subject.dept.id
      );
  }
};
const late_planned_spending_inner_render = (level) => {
  switch (level){
    case "gov":
      return (
        <Fragment>
          <TM k={'late_planned_spending_warning_gov'} />
          <MultiColumnList
            list_items={_.map(
              docs_with_late_planned_spending, 
              (org_id) => Dept.lookup(org_id).fancy_name
            )}
            column_count={ window.lang === "en" && docs_with_late_planned_spending.length > 3 ? 2 : 1 }
            li_class={ docs_with_late_planned_spending.length > 4 ? "font-small" : '' }
          />
        </Fragment>
      );
    default :
      return <TM k={`late_planned_spending_warning_${level}`} />;
  }
};
export const declare_late_planned_spending_panel = () => declare_panel({
  panel_key: 'late_planned_spending_warning',
  levels: ['gov', 'dept', 'crso', 'program'],
  panel_config_func: (level, panel_key) => ({
    static: true,
    footnotes: false,
    source: false,
    info_deps: [],
    calculate: late_planned_spending_calculate,
    render: () => (
      <WarningPanel center_text={level !== 'gov'}>
        {late_planned_spending_inner_render(level)}
      </WarningPanel>
    ),
  }),
});


export const get_warning_panel_footnotes = (subject, footnote_tags) => _.chain([
  {
    tags: ['PLANNED_EXP','EXP'],
    calculate: gap_year_warning_calculate,
    render: gap_year_warning_inner_render,
  },
  {
    tags: ['DP_RESULTS'],
    calculate: late_results_warning_calculate,
    render: late_results_warning_inner_render,
  },
  {
    tags: ['PLANNED_EXP'],
    calculate: late_planned_spending_calculate,
    render: late_planned_spending_inner_render,
  },
])
  .filter( ({tags, calculate}) => _.intersection(tags, footnote_tags).length === tags.length && calculate(subject) )
  .flatMap( ({render}) => ({ component: render(subject.level) }) )
  .value();