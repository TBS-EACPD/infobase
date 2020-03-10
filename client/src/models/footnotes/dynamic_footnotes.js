import text from './dynamic_footnotes.yaml';

import { Gov, Dept, CRSO, Program } from '../organizational_entities.js';
import { actual_to_planned_gap_year } from '../years.js';
import { create_text_maker } from '../text.js';

const all_subject_classes= [Gov, Dept, CRSO, Program];
const text_maker = create_text_maker(text);


const gap_year_warning = _.map(
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


const docs_with_late_planned_spending = [247, 347];


const dynamic_footnotes = _.chain([
  ...gap_year_warning,
])
  .compact()
  .map( 
    (footnote, index) => ({
      ...footnote,
      id: `dynamic_footnote_${index}`,
    })
  )
  .value();

export {
  dynamic_footnotes,
  docs_with_late_planned_spending,
};