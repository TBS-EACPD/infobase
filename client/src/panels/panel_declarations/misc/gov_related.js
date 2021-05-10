import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { TM } from "src/components/index";

import { create_text_maker } from "src/models/text";

import text from "./gov_related.yaml";

const text_maker = create_text_maker(text);

export const declare_gov_related_info_panel = () =>
  declare_panel({
    panel_key: "gov_related_info",
    levels: ["gov"],

    panel_config_func: (level, panel_key) => ({
      footnotes: false,
      calculate: _.constant(true),
      title: text_maker("gov_related_info_title"),
      render({ title }) {
        return (
          <InfographicPanel title={title}>
            <div className="medium-panel-text" style={{ lineHeight: "40px" }}>
              <TM tmf={text_maker} k="gov_related_info_text" />
            </div>
          </InfographicPanel>
        );
      },
    }),
  });
