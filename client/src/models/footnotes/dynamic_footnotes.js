import text from './dynamic_footnotes.yaml';

import { Gov, Dept, CRSO, Program } from '../organizational_entities.js';
import { actual_to_planned_gap_year } from '../years.js';
import { result_docs_in_tabling_order } from '../results.js';
import { create_text_maker } from '../text.js';

const all_subject_classes= [Gov, Dept, CRSO, Program];
const text_maker = create_text_maker(text);


const depts_with_late_planned_spending = [247, 347];


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
  
  
  const late_dp_footnotes = _.map(
    all_subject_classes,
    (subject_class) => (
      actual_to_planned_gap_year && 
      {
        subject: subject_class,
        topic_keys: ['DP_RESULTS', 'PLANNED_EXP'],
        text: text_maker('gap_year_warning', {gap_year: actual_to_planned_gap_year}),
      }
    )
  );
  
  
  const entities_with_late_planned_spending = _.chain(depts_with_late_planned_spending)
    .map(Dept.lookup)
    .flatMap(
      (dept) => [
        dept,
        ...dept.crsos,
        ...dept.programs,
      ]
    )
    .value();
  const late_planned_spending_footnotes = _.map(
    [
      Gov,
      ...entities_with_late_planned_spending,
    ],
    (subject) => (
      actual_to_planned_gap_year && 
      {
        subject: subject,
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
      }
    )
  );
  
  
  return _.chain([
    ...gap_year_footnotes,
    ...late_dp_footnotes,
    ...late_planned_spending_footnotes,
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