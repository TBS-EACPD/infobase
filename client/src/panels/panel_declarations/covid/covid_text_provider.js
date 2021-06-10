import _ from "lodash";

import { create_text_maker_component } from "src/components/index";

import common_covid_lang from "./covid_common_lang.yaml";

export const covid_create_text_maker_component = (text) => {
  const extended_text_bundle = _.isEmpty(text)
    ? [common_covid_lang]
    : _.isArray(text)
    ? [...text, common_covid_lang]
    : [text, common_covid_lang];

  return create_text_maker_component(extended_text_bundle);
};
