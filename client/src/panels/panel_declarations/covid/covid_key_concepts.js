import _ from "lodash";
import React from "react";

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

export const declare_covid_key_concepts_panel = () =>
  declare_panel({
    panel_key: "covid_key_concepts",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      is_static: true,
      footnotes: false,
      source: false,
      calculate: _.constant(true),
      render: () => (
        <SomeThingsToKeepInMind>
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
      ),
    }),
  });
