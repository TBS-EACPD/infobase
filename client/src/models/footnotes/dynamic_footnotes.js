import text from './dynamic_footnotes.yaml';

import { Gov, Dept, CRSO, Program } from '../organizational_entities.js';
import { actual_to_planned_gap_year } from '../years.js';
import { result_docs_in_tabling_order } from '../results.js';
import { create_text_maker } from '../text.js';

const all_subject_classes= [Gov, Dept, CRSO, Program];
const text_maker = create_text_maker(text);


const depts_with_late_planned_spending = [];


const expand_dept_cr_and_programs = (dept) => [
  dept,
  ...dept.crsos,
  ...dept.programs,
];

const get_dynamic_footnotes = () => {
  const gap_year_footnotes = _.map(
    all_subject_classes,
    (subject_class) => (
      actual_to_planned_gap_year && 
      {
        subject: subject_class,
        topic_keys: ['EXP', 'PLANNED_EXP'],
        text: text_maker('gap_year_warning', {gap_year: actual_to_planned_gap_year}),
      }
    )
  );
  
    
  const entities_with_late_planned_spending = _.chain(depts_with_late_planned_spending)
    .map(Dept.lookup)
    .flatMap( expand_dept_cr_and_programs )
    .value();
  const late_planned_spending_footnotes = _.map(
    [
      Gov,
      ...entities_with_late_planned_spending,
    ],
    (subject) => ({
      subject,
      topic_keys: ['PLANNED_EXP', 'DP_EXP'],
      text: `<p>${text_maker(`late_planned_spending_warning_${subject.level}`)}</p>${
        subject.level === 'gov' ? 
          `<ul>${
            _.reduce(
              depts_with_late_planned_spending,
              (elements, org_id) => `${elements}<li>${Dept.lookup(org_id).fancy_name}</li>`,
              ''
            )
          }</ul>` :
          ''
      }`,
    })
  );
  
  
  const docs_with_late_departments = _.chain(result_docs_in_tabling_order)
    .reverse()
    .filter(({late_departments}) => late_departments.length > 0)
    .value();
  const late_result_doc_footnotes = _.chain(docs_with_late_departments)
    .flatMap(
      ({late_departments, doc_type, year}) => _.chain(late_departments)
        .map(Dept.lookup)
        .flatMap( expand_dept_cr_and_programs )
        .map(
          (subject) => (
            actual_to_planned_gap_year && 
            {
              subject,
              topic_keys: [`${_.toUpper(doc_type)}_RESULTS`],
              text: text_maker(
                `late_results_warning_${subject.level}`,
                { result_doc_name: text_maker(`${doc_type}_name`, {year}) }
              ),
            }
          )
        )
        .value()
    )
    .value();

  const gov_late_result_doc_footnotes = _.map(
    docs_with_late_departments,
    ({late_departments, doc_type, year}) => ({
      subject: Gov,
      topic_keys: [`${_.toUpper(doc_type)}_RESULTS`],
      text: `<p>${text_maker('late_results_warning_gov', {result_doc_name: text_maker(`${doc_type}_name`, {year})} )}</p>${
        `<ul>${
          _.reduce(
            late_departments,
            (elements, org_id) => `${elements}<li>${Dept.lookup(org_id).fancy_name}</li>`,
            ''
          )
        }</ul>`
      }`,
    })
  );
  

  return _.chain([
    ...gap_year_footnotes,
    ...late_planned_spending_footnotes,
    ...late_result_doc_footnotes,
    ...gov_late_result_doc_footnotes,
  ])
    .compact()
    .map( 
      (footnote, index) => ({
        ...footnote,
        id: `dynamic_footnote_${index}`,
      })
    )
    .value();
};


export {
  get_dynamic_footnotes,
  depts_with_late_planned_spending,
};