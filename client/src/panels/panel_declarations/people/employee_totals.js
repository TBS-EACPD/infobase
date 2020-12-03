import { primaryColor, textColor } from "src/core/color_defs.js";

import {
  formats,
  run_template,
  year_templates,
  create_text_maker_component,
  StdPanel,
  Col,
  WrappedNivoLine,
  businessConstants,
  declare_panel,
} from "../shared.js";

import text from "./employee_totals.yaml";

const { months } = businessConstants;

const { text_maker, TM } = create_text_maker_component(text);

const { people_years, people_years_short_second } = year_templates;

export const declare_employee_totals_panel = () =>
  declare_panel({
    panel_key: "employee_totals",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeType"],

      calculate(subject) {
        const { orgEmployeeType } = this.tables;
        const q = orgEmployeeType.q(subject);
        return {
          series: people_years.map((y) => q.sum(y)),
          ticks: _.map(people_years_short_second, (y) => `${run_template(y)}`),
        };
      },

      render({ calculations, footnotes, sources }) {
        const { subject, panel_args } = calculations;
        const { series, ticks } = panel_args;

        const first_active_year_index = _.findIndex(series, (pop) => pop !== 0);
        const last_active_year_index = _.findLastIndex(
          series,
          (pop) => pop !== 0
        );
        const first_active_year = run_template(
          `${people_years[first_active_year_index]}`
        );
        const last_active_year = run_template(
          `${people_years[last_active_year_index]}`
        );
        const avg_num_emp =
          _.sum(series) /
          (last_active_year_index - first_active_year_index + 1);
        const last_year_num_emp = series[last_active_year_index];

        const text_calculations = {
          first_active_year,
          last_active_year,
          avg_num_emp,
          subject,
          last_year_num_emp,
        };

        const data_formatter = () => [
          {
            id: months[3].text,
            data: _.map(series, (data, index) => ({
              x: ticks[index],
              y: data,
            })),
          },
        ];

        return (
          <StdPanel
            title={text_maker(level + "_employee_totals_title")}
            {...{ footnotes, sources }}
          >
            <Col size={4} isText>
              <TM
                k={level + "_employee_totals_text"}
                args={text_calculations}
              />
            </Col>
            <Col size={8} isGraph>
              <WrappedNivoLine
                data={data_formatter()}
                raw_data={series}
                colors={primaryColor}
                is_money={false}
                yScale={{ toggle: true }}
                tooltip={(slice) => (
                  <div
                    style={{
                      color: textColor,
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <tbody>
                        {slice.data.map((tooltip_item) => (
                          <tr key={tooltip_item.serie.id}>
                            <td className="nivo-tooltip__icon">
                              <div
                                style={{
                                  height: "12px",
                                  width: "12px",
                                  backgroundColor: tooltip_item.serie.color,
                                }}
                              />
                            </td>
                            <td className="nivo-tooltip__label">
                              {tooltip_item.serie.id}
                            </td>
                            <td className="nivo-tooltip__label">
                              {tooltip_item.data.x}
                            </td>
                            <td
                              className="nivo-tooltip__value"
                              dangerouslySetInnerHTML={{
                                __html: formats.big_int(tooltip_item.data.y),
                              }}
                            />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              />
            </Col>
          </StdPanel>
        );
      },
    }),
  });
