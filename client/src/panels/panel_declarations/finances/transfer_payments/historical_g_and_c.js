import { Fragment } from "react";

import { GraphOverlay } from "../../../../components";
import {
  run_template,
  declare_panel,
  year_templates,
  businessConstants,
  StandardLegend,
  SelectAllControl,
  InfographicPanel,
  util_components,
  WrappedNivoLine,
} from "../../shared.js";

import { text_maker, TM } from "./gnc_text_provider.js";

const { transfer_payments } = businessConstants;
const { std_years } = year_templates;
const { SmartDisplayTable } = util_components;

const exp_years = std_years.map((year) => year + "exp");

const text_years = _.map(std_years, run_template);
const years_map = _.zipObject(exp_years, text_years);

//gov: this is the content of the entire panel
//dept: this is the top part of the panel
const tp_type_name = (type_id) => transfer_payments[type_id].text;
class HistTPTypes extends React.Component {
  constructor() {
    super();
    this.state = {
      active_types: ["o", "c", "g"],
    };
  }
  render() {
    const { text, series, text_split } = this.props;

    const { active_types } = this.state;
    const filtered_series = _.chain(series)
      .pick(active_types)
      .mapKeys((val, key) => tp_type_name(key))
      //HACKY: make sure the object's key are sorted
      //sorting an object doesn't really exist, but it works and it's the
      // only way to get the Line chart to display in the right order...
      .toPairs()
      .sortBy(([_k, vals]) => _.sum(vals))
      .reverse()
      .fromPairs()
      .value();

    const colors = infobase_colors();

    const legend_items = _.chain(series)
      .toPairs()
      .sortBy(([_k, vals]) => _.sum(vals))
      .reverse()
      .map(([key]) => {
        const type_name = tp_type_name(key);
        return {
          id: key,
          label: type_name,
          active: !!filtered_series[type_name],
          color: colors(type_name),
        };
      })
      .value();
    const expenditure_data = _.map(
      filtered_series,
      (expenditure_array, expenditure_label) => ({
        id: expenditure_label,
        data: expenditure_array.map((expenditure_value, year_index) => ({
          x: text_years[year_index],
          y: expenditure_value,
        })),
      })
    );

    const content = (
      <Fragment>
        {!window.is_a11y_mode && (
          <StandardLegend
            items={legend_items}
            isHorizontal={true}
            onClick={(id) =>
              !(
                !!filtered_series[tp_type_name(id)] &&
                _.size(filtered_series) === 1
              ) &&
              this.setState({ active_types: _.toggle_list(active_types, id) })
            }
          />
        )}
        <div style={{ position: "relative" }}>
          <GraphOverlay>
            <WrappedNivoLine
              enableArea={true}
              disable_y_axis_zoom={true}
              data={expenditure_data}
              colorBy={(d) => colors(d.id)}
              stacked={true}
            />
          </GraphOverlay>
        </div>
      </Fragment>
    );

    return (
      <div className="frow middle-xs">
        <div className={`fcol-md-${text_split}`}>
          <div className="medium_panel_text">{text}</div>
        </div>
        <div className={`fcol-md-${12 - text_split}`}>{content}</div>
      </div>
    );
  }
}

class DetailedHistTPItems extends React.Component {
  constructor(props) {
    super(props);
    const { rows } = props;
    this.state = {
      active_indices: [0],
      active_type: _.first(rows, "type_id").type_id,
    };

    this.color_scale = infobase_colors();
  }
  render() {
    const { rows } = this.props;
    const { active_indices, active_type } = this.state;
    const { color_scale } = this;

    const order_type_id = _.uniq(_.map(rows, "type_id"));
    const prepped_rows = _.chain(rows)
      .filter({ type_id: active_type })
      .sortBy((row) => row["{{pa_last_year}}exp"])
      .reverse()
      .value();

    const custom_table_data = _.chain(prepped_rows)
      .filter((_val, ix) => _.includes(active_indices, ix))
      .map((row) => ({
        label: row.tp,
        ..._.chain(years_map)
          .map((text_year, exp_year) => [text_year, row[exp_year]])
          .fromPairs()
          .value(),
      }))
      .value();
    const column_configs = {
      label: {
        index: 0,
        header: text_maker("transfer_payment"),
        is_searchable: true,
      },
      ..._.chain(text_years)
        .map((year, idx) => [
          year,
          {
            index: idx + 1,
            header: year,
            is_summable: true,
            formatter: "dollar",
          },
        ])
        .fromPairs()
        .value(),
    };

    const graph_series = _.chain(prepped_rows)
      .map((row) => [row.tp, _.map(exp_years, (yr) => row[yr])])
      .filter((_val, ix) => _.includes(active_indices, ix))
      .fromPairs()
      .value();

    const max_value = _.chain(prepped_rows)
      .map((row) => _.map(exp_years, (yr) => row[yr]))
      .flatten()
      .max()
      .value();

    const raw_data = _.flatMap(graph_series, (value) => value);

    const all_tp_idx = _.range(prepped_rows.length);
    const legend_items = _.concat(
      _.map(prepped_rows, (row, ix) => ({
        id: ix,
        label: row.tp,
        color: color_scale(row.tp),
        active: _.includes(active_indices, ix),
      }))
    );

    const detail_expend_data = _.map(
      graph_series,
      (expend_array, expend_label) => {
        return {
          id: expend_label,
          data: expend_array.map((expend_value, year_index) => ({
            y: expend_value,
            x: text_years[year_index],
          })),
        };
      }
    );

    const title_el = (
      <div className="h3">
        <TM k="historical_g_and_c_detailed_title" />
      </div>
    );

    if (window.is_a11y_mode) {
      return (
        <div>
          {title_el}
          <SmartDisplayTable
            data={_.map(rows, (record) => ({
              label: record.tp,
              ..._.chain(std_years)
                .map((yr) => [run_template(yr), record[`${yr}exp`] || 0])
                .fromPairs()
                .value(),
            }))}
            column_configs={column_configs}
          />
        </div>
      );
    }

    const get_line_graph = (() => {
      const is_data_empty =
        _.isEmpty(detail_expend_data) && _.isEmpty(raw_data);
      const empty_data_nivo_props = is_data_empty && {
        data: [
          {
            id: "none",
            data: _.map(text_years, (year) => ({
              x: year,
              y: max_value,
            })),
          },
        ],
        raw_data: [max_value],
        enableDots: false,
        lineWidth: 0,
        isInteractive: false,
      };

      const nivo_props = {
        data: detail_expend_data,
        raw_data: raw_data,
        margin: {
          top: 50,
          right: 30,
          bottom: 50,
          left: 70,
        },
        colorBy: (d) => color_scale(d.id),
        custom_table: (
          <SmartDisplayTable
            data={custom_table_data}
            column_configs={column_configs}
          />
        ),
        ...empty_data_nivo_props,
      };

      return (
        <GraphOverlay>
          <WrappedNivoLine {...nivo_props} />
        </GraphOverlay>
      );
    })();

    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {title_el}
          <select
            style={{ margin: "2rem 0" }}
            className="form-control"
            onChange={(evt) => {
              //reset colour scale for new items
              this.color_scale = infobase_colors();
              this.setState({
                active_type: evt.target.value,
                active_indices: [0],
              });
            }}
          >
            {_.map(order_type_id, (type_id) => (
              <option value={type_id} key={type_id}>
                {tp_type_name(type_id)}
              </option>
            ))}
          </select>
        </div>
        <div className="frow">
          <div className="fcol-md-4">
            <StandardLegend
              items={legend_items}
              onClick={(id) =>
                !(active_indices.length == 1 && active_indices.includes(id)) &&
                this.setState({
                  active_indices: _.toggle_list(active_indices, id),
                })
              }
              Controls={
                <SelectAllControl
                  SelectAllOnClick={() =>
                    this.setState({ active_indices: all_tp_idx })
                  }
                  SelectNoneOnClick={() =>
                    this.setState({ active_indices: [] })
                  }
                />
              }
            />
          </div>
          <div className="fcol-md-8" style={{ position: "relative" }}>
            {get_line_graph}
          </div>
        </div>
      </div>
    );
  }
}

export const declare_historical_g_and_c_panel = () =>
  declare_panel({
    panel_key: "historical_g_and_c",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "gov":
          return {
            info_deps: ["orgTransferPayments_gov_info"],

            depends_on: ["orgTransferPayments"],
            calculate(subject) {
              const { orgTransferPayments } = this.tables;
              return orgTransferPayments.payment_type_ids(exp_years, false);
            },
            render({ calculations, footnotes, sources }) {
              const { info, panel_args: series } = calculations;
              return (
                <InfographicPanel
                  title={text_maker("historical_g_and_c_title")}
                  {...{ footnotes, sources }}
                >
                  <HistTPTypes
                    text={<TM k="gov_historical_g_and_c_text" args={info} />}
                    text_split={4}
                    series={series}
                  />
                </InfographicPanel>
              );
            },
          };
        case "dept":
          return {
            info_deps: [
              "orgTransferPayments_gov_info",
              "orgTransferPayments_dept_info",
            ],

            depends_on: ["orgTransferPayments"],
            key: "historical_g_and_c",
            footnotes: ["SOBJ10"],
            calculate(dept) {
              const { orgTransferPayments } = this.tables;

              const rolled_up_transfer_payments = orgTransferPayments.payment_type_ids(
                exp_years,
                dept.unique_id
              );

              const has_transfer_payments = _.chain(rolled_up_transfer_payments)
                .values()
                .flatten()
                .some((value) => value !== 0)
                .value();

              return (
                has_transfer_payments && {
                  rolled_up: rolled_up_transfer_payments,
                  rows: _.chain(orgTransferPayments.q(dept).data)
                    .sortBy("{{pa_last_year}}exp")
                    .reverse()
                    .value(),
                }
              );
            },
            render({ calculations, footnotes, sources }) {
              const {
                info,
                panel_args: { rows, rolled_up },
              } = calculations;
              const text_content = (
                <TM k="dept_historical_g_and_c_text" args={info} />
              );

              return (
                <InfographicPanel
                  title={text_maker("historical_g_and_c_title")}
                  {...{ sources, footnotes }}
                >
                  <HistTPTypes
                    text={text_content}
                    text_split={6}
                    series={rolled_up}
                  />
                  <div className="panel-separator" />
                  <DetailedHistTPItems rows={rows} />
                </InfographicPanel>
              );
            },
          };
      }
    },
  });
