import _ from "lodash";

import {
  ParsedCsvWithUndefineds,
  enforced_required_fields,
} from "src/models/utils/populate_utils";

import { lang } from "src/core/injected_build_constants";

import { sanitized_marked } from "src/general_utils";

import { faqStore } from "./faq";

export const populate_faq = (faq: ParsedCsvWithUndefineds) =>
  _.each(faq, (faq) => {
    faqStore.create_and_register({
      ...enforced_required_fields({
        id: faq.id,
        question: faq[`q_${lang}`],
        answer: sanitized_marked(faq[`a_${lang}`] as string),
      }),
    });
  });
