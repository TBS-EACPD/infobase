import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index";

import {
  COVID_DATE_LAST_UPDATED,
  COVID_CURRENT_YEAR,
  COVID_NEXT_YEAR,
} from "src/models/covid/covid_config";

import common_covid_lang from "./covid_common_lang.yaml";

export const covid_create_text_maker_component = (text) => {
  const extended_text_bundle = _.isEmpty(text)
    ? [common_covid_lang]
    : _.isArray(text)
    ? [...text, common_covid_lang]
    : [text, common_covid_lang];

  const { text_maker, TM } = create_text_maker_component(extended_text_bundle);

  const extended_text_maker = (key, args) =>
    text_maker(key, {
      ...args,
      COVID_DATE_LAST_UPDATED,
      COVID_CURRENT_YEAR,
      COVID_NEXT_YEAR,
    });

  const ExtendedTM = (props) => <TM tmf={extended_text_maker} {...props} />;

  return {
    text_maker: extended_text_maker,
    TM: ExtendedTM,
  };
};
