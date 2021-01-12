import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import { SmartDisplayTable, GraphOverlay } from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants.ts";
import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { infobase_colors } from "src/core/color_schemes.ts";

import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { StandardLegend, SelectAllControl } from "src/charts/legends/index.js";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index.js";

import { toggle_list } from "src/general_utils.js";

import { text_maker, TM } from "./gnc_text_provider.js";

const { transfer_payments } = businessConstants;
const { std_years } = year_templates;

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
        {!is_a11y_mode && (
          <StandardLegend
            items={legend_items}
            isHorizontal={true}
            onClick={(id) =>
              !(
                !!filtered_series[tp_type_name(id)] &&
                _.size(filtered_series) === 1
              ) &&
              this.setState({ active_types: toggle_list(active_types, id) })
            }
          />
        )}
        <div style={{ position: "relative" }}>
          <GraphOverlay>
            <WrappedNivoLine
              enableArea={true}
              disable_y_axis_zoom={true}
              data={expenditure_data}
              colors={(d) => colors(d.id)}
              stacked={true}
            />
          </GraphOverlay>
        </div>
      </Fragment>
    );

    return (
      <div className="row align-items-center">
        <div className={`col-12 col-lg-${text_split}`}>
          <div className="medium-panel-text">{text}</div>
        </div>
        <div className={`col-12 col-lg-${12 - text_split}`}>{content}</div>
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
            formatter: "compact1_written",
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

    if (is_a11y_mode) {
      return (
        <div>
          {title_el}
          <DisplayTable
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
        enablePoints: false,
        lineWidth: 0,
        isInteractive: false,
      };

      const nivo_props = {
        ...empty_data_nivo_props,
        data: _.clone(detail_expend_data).reverse(),
        raw_data: raw_data,
        margin: {
          top: 50,
          right: 30,
          bottom: 50,
          left: 70,
        },
        colors: (d) => color_scale(d.id),
        custom_table: (
          <DisplayTable
            data={custom_table_data}
            column_configs={column_configs}
          />
        ),
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
        <div className="row">
          <div className="col-12 col-lg-4">
            <StandardLegend
              items={legend_items}
              onClick={(id) =>
                !(active_indices.length == 1 && active_indices.includes(id)) &&
                this.setState({
                  active_indices: toggle_list(active_indices, id),
                })
              }
              Controls={
                <SelectAllControl
                  key="SelectAllControl"
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
          <div className="col-12 col-lg-8" style={{ position: "relative" }}>
            {get_line_graph}
          </div>
        </div>
      </div>
    );
  }
}

const common_panel_config = {
  title: text_maker("historical_g_and_c_title"),
  depends_on: ["orgTransferPayments"],
};

export const declare_historical_g_and_c_panel = () =>
  declare_panel({
    panel_key: "historical_g_and_c",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "gov":
          return {
            ...common_panel_config,

            calculate(subject) {
              const { orgTransferPayments } = this.tables;

              const payments = orgTransferPayments.payment_type_ids(
                exp_years,
                false
              );

              const five_year_avg =
                (_.sum(payments.c) + _.sum(payments.g) + _.sum(payments.o)) /
                std_years.length;
              const avgs = _.map(payments, (payment, type) => ({
                type,
                value: _.sum(payment) / payment.length,
              }));
              const largest_avg_payment = _.maxBy(avgs, "value");

              const largest_type =
                transfer_payments[largest_avg_payment.type].text;

              return {
                payments,
                five_year_avg,
                largest_avg: largest_avg_payment.value,
                largest_type,
              };
            },
            render({ title, calculations, footnotes, sources }) {
              const { panel_args } = calculations;
              const {
                payments: series,
                five_year_avg,
                largest_avg,
                largest_type,
              } = panel_args;
              return (
                <InfographicPanel
                  allowOverflow={true}
                  {...{ title, footnotes, sources }}
                >
                  <HistTPTypes
                    text={
                      <TM
                        k="gov_historical_g_and_c_text"
                        args={{ five_year_avg, largest_avg, largest_type }}
                      />
                    }
                    text_split={4}
                    series={series}
                  />
                </InfographicPanel>
              );
            },
          };
        case "dept":
          return {
            ...common_panel_config,
            key: "historical_g_and_c",
            footnotes: ["SOBJ10"],
            calculate(dept) {
              const { orgTransferPayments } = this.tables;

              const rolled_up_transfer_payments = orgTransferPayments.payment_type_ids(
                exp_years,
                dept.unique_id
              );

              const five_year_avg =
                (_.sum(rolled_up_transfer_payments.c) +
                  _.sum(rolled_up_transfer_payments.g) +
                  _.sum(rolled_up_transfer_payments.o)) /
                std_years.length;

              const avgs = _.map(
                rolled_up_transfer_payments,
                (payments, type) => ({
                  type,
                  value: _.sum(payments) / payments.length,
                })
              );
              const max_payment = _.maxBy(avgs, "value");

              const max_type = transfer_payments[max_payment.type].text;
              const has_transfer_payments = _.chain(rolled_up_transfer_payments)
                .values()
                .flatten()
                .some((value) => value !== 0)
                .value();

              const rows = _.chain(orgTransferPayments.q(dept).data)
                .sortBy("{{pa_last_year}}exp")
                .reverse()
                .value();

              const tp_average_payments = _.map(
                rows,
                (row) =>
                  _.reduce(exp_years, (sum, year) => sum + row[year], 0) /
                  exp_years.length
              );

              const max_tp_avg = _.max(tp_average_payments);
              const max_tp =
                rows[_.indexOf(tp_average_payments, max_tp_avg)].tp;

              const text_calculations = {
                dept,
                five_year_avg,
                max_avg: max_payment.value,
                max_type,
                max_tp_avg,
                max_tp,
              };

              return (
                has_transfer_payments && {
                  rolled_up: rolled_up_transfer_payments,
                  rows: rows,
                  text_calculations,
                }
              );
            },
            render({ title, calculations, footnotes, sources }) {
              const {
                panel_args: { rows, rolled_up, text_calculations },
              } = calculations;
              const text_content = (
                <TM k="dept_historical_g_and_c_text" args={text_calculations} />
              );

              return (
                <InfographicPanel
                  allowOverflow={true}
                  {...{ title, sources, footnotes }}
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
