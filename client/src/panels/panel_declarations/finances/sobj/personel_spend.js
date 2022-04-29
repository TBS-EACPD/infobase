import _ from "lodash";
import React from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { GraphOverlay } from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index";
import { primaryColor } from "src/style_constants/index";

import { text_maker, TM } from "./sobj_text_provider";
const { sos } = businessConstants;
const { std_years } = year_templates;

export const declare_personnel_spend_panel = () =>
  declare_panel({
    panel_key: "personnel_spend",
    subject_types: ["gov"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["orgSobjs"],
      get_dataset_keys: () => ["org_standard_objects"],
      get_title: () => text_maker("personnel_spend_title"),
      calculate: ({ subject, tables }) => {
        const { orgSobjs } = tables;
        const year_value_pairs = _.map(std_years, (year) => [
          run_template(year),
          orgSobjs.sum_cols_by_grouped_data(year, "so", subject)[sos[1].text],
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
        const { text_calculations } = calculations;

        const personnel_data = [
          {
            id: "Personnel",
            data: _.map(calculations.series, (spending_data, year_index) => ({
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
                    raw_data={calculations.series}
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
