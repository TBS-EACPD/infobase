import _ from "lodash";
import React from "react";
import { withRouter } from "react-router";

import { SafeJSURL } from "src/general_utils.js";
import { infograph_options_href_template } from "src/infographic/infographic_link.js";

import {
  util_components,
  SomeThingsToKeepInMind,
  declare_panel,
} from "../shared.js";

import text from "./covid_key_concepts.yaml";

const { create_text_maker_component, KeyConceptList } = util_components;

const { TM } = create_text_maker_component(text);

// TODO lots of dates and stuff hardcoded in covid_key_concept text,
// do not want that since some of it will be changing as often as monthly...

const panel_key = "covid_key_concepts";

export const declare_covid_key_concepts_panel = () =>
  declare_panel({
    panel_key,
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      is_static: true,
      footnotes: false,
      source: false,
      calculate: _.constant(true),
      render: withRouter(({ match: { params: { options } } }) => (
        <SomeThingsToKeepInMind
          is_initially_expanded={
            panel_key === SafeJSURL.parse(options)?.panel_key
          }
        >
          <KeyConceptList
            question_answer_pairs={[
              [
                <TM key={"q"} k={"covid_questions_up_to_date_q"} />,
                <TM key={"a"} k={"covid_questions_up_to_date_a"} />,
              ],
              [
                <TM key={"q"} k={"covid_questions_financial_q"} />,
                <TM key={"a"} k={"covid_questions_financial_a"} />,
              ],
              [
                <TM key={"q"} k={"covid_questions_funding_value_q"} />,
                <TM key={"a"} k={"covid_questions_funding_value_a"} />,
              ],
            ]}
          />
        </SomeThingsToKeepInMind>
      )),
    }),
  });

export const get_covid_key_concepts_link = (subject) =>
  infograph_options_href_template(subject, "covid", { panel_key });
