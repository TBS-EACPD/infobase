import _ from "lodash";
import React from "react";

import { InfographicPanel, declare_panel } from "../shared.js";

import { covid_create_text_maker_component } from "./covid_text_provider.js";

import text from "./covid_intro.yaml";

const { text_maker, TM } = covid_create_text_maker_component(text);

export const declare_covid_intro_panel = () =>
  declare_panel({
    panel_key: "covid_intro",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      footnotes: ["COVID"],
      source: (subject) => [],
      calculate: _.constant(true),
      render: ({
        calculations: { panel_args, subject },
        footnotes,
        sources,
      }) => (
        <InfographicPanel
          title={text_maker("covid_intro_panel_title")}
          {...{
            sources,
            footnotes,
          }}
        >
          <TM
            k={"covid_intro_text"}
            args={panel_args}
            className="medium-panel-text"
          />
        </InfographicPanel>
      ),
    }),
  });
