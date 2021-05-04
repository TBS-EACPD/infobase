import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import {
  StdPanel,
  Col,
} from "src/panels/panel_declarations/InfographicPanel.js";

import { GraphOverlay } from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.ts";
import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { primaryColor } from "src/core/color_defs.js";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index.js";

import { text_maker, TM } from "./sobj_text_provider.js";
const { sos } = businessConstants;
const { std_years } = year_templates;

export const declare_personnel_spend_panel = () =>
  declare_panel({
    panel_key: "personnel_spend",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgSobjs"],
      title: text_maker("personnel_spend_title"),
      calculate(subject, data) {
        const { orgSobjs } = this.tables;

        const year_value_pairs = _.map(std_years, (year) => [
          run_template(year),
          orgSobjs.horizontal(year, false)[sos[1].text],
        ]);

        const series = _.map(year_value_pairs, _.last);
        const five_year_avg = _.sum(series) / series.length;

        const sorted_pairs = _.sortBy(year_value_pairs, _.last);

        const [max_year, max_spend] = _.last(sorted_pairs);
        const [min_year, min_spend] = _.first(sorted_pairs);
        const text_calculations = {
          five_year_avg,
          max_spend,
          max_year,
          min_spend,
          min_year,
        };

        return {
          series,
          text_calculations,
        };
      },

      render({ title, calculations, footnotes, sources }) {
        const { panel_args } = calculations;

        const { text_calculations } = panel_args;

        const personnel_data = [
          {
            id: "Personnel",
            data: _.map(panel_args.series, (spending_data, year_index) => ({
              y: spending_data,
              x: run_template(std_years[year_index]),
            })),
          },
        ];

        return (
          <StdPanel {...{ title, footnotes, sources }}>
            <Col size={5} isText>
              <TM k="personnel_spend_text" args={text_calculations} />
            </Col>
            <Col size={7} isGraph>
              <div position="relative">
                <GraphOverlay>
                  <WrappedNivoLine
                    raw_data={panel_args.series}
                    data={personnel_data}
                    margin={{
                      top: 50,
                      right: 40,
                      bottom: 50,
                      left: 65,
                    }}
                    colors={primaryColor}
                  />
                </GraphOverlay>
              </div>
            </Col>
          </StdPanel>
        );
      },
    }),
  });
