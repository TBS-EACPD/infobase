import React from "react";

import _ from "src/app_bootstrap/lodash_mixins.js";

import {
  declare_panel,
  create_text_maker,
  TM,
  InfographicPanel,
} from "../shared.js";

import text from "./gov_related.yaml";

const text_maker = create_text_maker(text);

export const declare_gov_related_info_panel = () =>
  declare_panel({
    panel_key: "gov_related_info",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      footnotes: false,
      calculate: _.constant(true),
      render() {
        return (
          <InfographicPanel title={text_maker("gov_related_info_title")}>
            <div className="medium-panel-text" style={{ lineHeight: "40px" }}>
              <TM tmf={text_maker} k="gov_related_info_text" />
            </div>
          </InfographicPanel>
        );
      },
    }),
  });
