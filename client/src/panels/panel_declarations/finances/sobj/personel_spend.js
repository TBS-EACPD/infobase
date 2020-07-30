import { GraphOverlay } from "../../../../components";
import {
  declare_panel,
  year_templates,
  businessConstants,
  StdPanel,
  Col,
  WrappedNivoLine,
  run_template,
} from "../../shared.js";

import { text_maker, TM } from "./sobj_text_provider.js";
const { sos } = businessConstants;
const { std_years } = year_templates;

export const declare_personnel_spend_panel = () =>
  declare_panel({
    panel_key: "personnel_spend",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgSobjs"],

      calculate(subject, data) {
        const { orgSobjs } = this.tables;

        const series = _.map(
          std_years,
          (year) => orgSobjs.horizontal(year, false)[sos[1].text]
        );

        const five_year_avg = _.sum(series) / series.length;

        const max_spend = _.max(series);
        const max_year = run_template(
          `${std_years[series.indexOf(max_spend)]}`
        );

        const min_spend = _.min(series);
        const min_year = run_template(
          `${std_years[series.indexOf(min_spend)]}`
        );

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

      render({ calculations, footnotes, sources }) {
        const { panel_args } = calculations;

        const { text_calculations } = panel_args;

        let graph_content;
        if (window.is_a11y_mode) {
          graph_content = (
            <A11yTable
              data_col_headers={[text_maker("spending")]}
              data={_.chain(std_years)
                .map(run_template)
                .zip(panel_args.series["0"])
                .map(([label, amt]) => ({
                  label,
                  data: <Format type="compact1_written" content={amt} />,
                }))
                .value()}
            />
          );
        } else {
          const personnel_data = () => [
            {
              id: "Personnel",
              data: _.map(
                panel_args.series[0],
                (spending_data, year_index) => ({
                  y: spending_data,
                  x: run_template(std_years[year_index]),
                })
              ),
            },
          ];

          graph_content = (
            <div position="relative">
              <GraphOverlay>
                <WrappedNivoLine
                  raw_data={panel_args.series}
                  data={personnel_data()}
                  margin={{
                    top: 50,
                    right: 40,
                    bottom: 50,
                    left: 65,
                  }}
                  colors={window.infobase_color_constants.primaryColor}
                />
              </GraphOverlay>
            </div>
          );
        }

        return (
          <StdPanel
            title={text_maker("personnel_spend_title")}
            {...{ footnotes, sources }}
          >
            <Col size={5} isText>
              <TM k="personnel_spend_text" args={text_calculations} />
            </Col>
            <Col size={7} isGraph>
              <div position="relative">
                <GraphOverlay>
                  <WrappedNivoLine
                    raw_data={panel_args.series[0]}
                    data={personnel_data}
                    margin={{
                      top: 50,
                      right: 40,
                      bottom: 50,
                      left: 65,
                    }}
                    colors={window.infobase_color_constants.primaryColor}
                  />
                </GraphOverlay>
              </div>
            </Col>
          </StdPanel>
        );
      },
    }),
  });
