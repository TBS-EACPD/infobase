import { GraphOverlay } from "../../../../components";
import {
  InfographicPanel,
  Subject,
  run_template,
  create_text_maker_component,
  year_templates,
  StandardLegend,
  A11yTable,
  WrappedNivoBar,
  declare_panel,
} from "../../shared.js";

import text from "./internal_services.yaml";


const { Gov, Tag } = Subject;
const { std_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);

export const declare_internal_services_panel = () =>
  declare_panel({
    panel_key: "internal_services",
    levels: ["dept"],
    panel_config_func: () => ({
      depends_on: ["programFtes"],
      title: "internal_service_panel_title",
      calculate(subject) {
        const { programFtes } = this.tables;

        const isc_crsos = _.filter(subject.crsos, "is_internal_service");
        const isc_tag = Tag.lookup("GOC017");

        const last_year_fte_col = "{{pa_last_year}}";
        const gov_fte_total = programFtes.q(Gov).sum(last_year_fte_col);
        const gov_isc_fte = programFtes.q(isc_tag).sum(last_year_fte_col);

        const isc = text_maker("internal_services");
        const non_isc = text_maker("other_programs");
        const series = _.map(std_years, (yr) => {
          const isc_amt = _.sum(
            _.map(isc_crsos, (crso) => programFtes.q(crso).sum(yr))
          );
          return {
            [isc]: isc_amt,
            [non_isc]: programFtes.q(subject).sum(yr) - isc_amt,
          };
        });

        const total_fte = programFtes.q(subject).sum(last_year_fte_col);
        if (total_fte === 0) {
          return false;
        }
        const isc_fte = _.last(series)[isc];

        return {
          gov_fte_total,
          gov_isc_fte,

          total_fte,
          isc_fte,

          series,
        };
      },
      render({ calculations, sources, footnotes }) {
        const {
          subject,
          panel_args: {
            gov_fte_total,
            gov_isc_fte,
            total_fte,
            isc_fte,
            series,
          },
        } = calculations;

        const years = _.map(std_years, (yr) => run_template(yr));
        const label_keys = [
          text_maker("internal_services"),
          text_maker("other_programs"),
        ];
        const colors = infobase_colors();

        const first_active_isc = _.findIndex(
          series,
          (data) => data[label_keys[0]] !== 0
        );
        const last_active_isc = _.findLastIndex(
          series,
          (data) => data[label_keys[0]] !== 0
        );

        const bar_series = _.reduce(
          label_keys,
          (result, label_value) => {
            _.assign(
              result,
              _.fromPairs([[label_value, _.map(series, label_value)]])
            );
            return result;
          },
          {}
        );

        const bar_data = _.chain(years)
          .map((date, date_index) => ({
            date,
            ..._.chain(bar_series)
              .map((data, label) => [label, data[date_index]])
              .fromPairs()
              .value(),
          }))
          .filter(
            (isc, isc_index) =>
              isc_index >= first_active_isc && isc_index <= last_active_isc
          )
          .value();

        const legend_items = _.reduce(
          label_keys,
          (result, label_value) => {
            result.push({
              id: label_value,
              label: label_value,
              color: colors(label_value),
            });
            return result;
          },
          []
        );

        const graph_content = (() => {
          if (window.is_a11y_mode) {
            return (
              <A11yTable
                table_name={text_maker("internal_service_panel_title")}
                data={_.chain(bar_data)
                  .flatMap(_.keys)
                  .uniq()
                  .pull("date")
                  .map((label) => ({
                    label,
                    data: _.map(bar_data, label),
                  }))
                  .value()}
                label_col_header={text_maker("program")}
                data_col_headers={std_years.map((yr) => run_template(yr))}
              />
            );
          } else {
            return (
              <div className="frow md-middle">
                <div className="fcol-md-3">
                  <StandardLegend
                    items={legend_items}
                    LegendCheckBoxProps={{ isSolidBox: true }}
                  />
                </div>
                <div className="fcol-md-9">
                  <GraphOverlay>
                    <WrappedNivoBar
                      data={bar_data}
                      indexBy="date"
                      colorBy={(d) => colors(d.id)}
                      keys={label_keys}
                      is_money={false}
                      margin={{
                        top: 15,
                        right: 30,
                        bottom: 40,
                        left: 50,
                      }}
                      graph_height="300px"
                    />
                  </GraphOverlay>
                </div>
              </div>
            );
          }
        })();

        const to_render = (
          <div>
            <div className="medium_panel_text" style={{ marginBottom: "15px" }}>
              <TM
                k="internal_service_panel_text"
                args={{
                  subject,
                  isc_fte_pct: isc_fte / total_fte,
                  gov_isc_fte_pct: gov_isc_fte / gov_fte_total,
                }}
              />
            </div>
            {graph_content}
          </div>
        );

        return (
          !_.isEmpty(bar_data) && (
            <InfographicPanel
              title={text_maker("internal_service_panel_title")}
              {...{ sources, footnotes }}
            >
              {to_render}
            </InfographicPanel>
          )
        );
      },
    }),
  });
