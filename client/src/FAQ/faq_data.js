import marked from "marked";

import faq_csv_string from "../../../data/faq.csv";


const DISABLED_QUESTIONS = [];

export const faq_data = _.chain(faq_csv_string)
  .thru(d3.csvParse)
  .map((qa_row) => [
    qa_row.id,
    {
      q: qa_row[`q_${window.lang}`],
      a: marked(qa_row[`a_${window.lang}`], { sanitize: false, gfm: true }),
    },
  ])
  .fromPairs()
  .omit(DISABLED_QUESTIONS)
  .value();
