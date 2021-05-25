import { csvParse } from "d3-dsv";
import _ from "lodash";
import marked from "marked";

import { lang } from "src/core/injected_build_constants";

/* eslint-disable no-restricted-imports */
import faq_csv_string from "../../../data/faq.csv";

const DISABLED_QUESTIONS: string[] = [];

export const faq_data = _.chain(faq_csv_string)
  .thru((csv_str) => csvParse(csv_str))
  .map((qa_row) => [
    qa_row.id,
    {
      q: qa_row[`q_${lang}`],
      a: marked(qa_row[`a_${lang}`]!, { sanitize: false, gfm: true }),
    },
  ])
  .fromPairs()
  .omit(DISABLED_QUESTIONS)
  .value();
