import { scaleLinear } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  DisplayTable,
} from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import { run_template } from "src/models/text";

import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { Canada } from "src/charts/canada/index";

import text from "./tp_by_region.yaml";

const { tp_by_region_years } = year_templates;

const { text_maker, TM } = create_text_maker_component(text);
const { provinces, le_provinces, de_provinces } = businessConstants;

const group_prov_data_by_year = (data_by_prov) =>
  _.chain(data_by_prov)
    .map((values, prov_code) => _.map(values, (value) => [prov_code, value]))
    .unzip()
    .map(_.fromPairs)
    .value();

const get_text_args = (subject, transfer_payment_data) => {
  const last_year_data = _.last(transfer_payment_data);

  const subject_total_value = _.chain(last_year_data)
    .values()
    .reduce((accumulator, value) => accumulator + value, 0)
    .value();

  const [largest_total_prov_code, largest_total_value] = _.chain(last_year_data)
    .toPairs()
    .sortBy(([_prov_code, value]) => value)
    .last()
    .value();
  const largest_total_prov = provinces[largest_total_prov_code].text;
  const le_largest_total_prov = le_provinces[largest_total_prov_code].text;
  const de_largest_total_prov = de_provinces[largest_total_prov_code].text;
  const largest_total_percent = largest_total_value / subject_total_value;

  return {
    subject,
    is_gov: subject.subject_type === "gov",
    subject_total_value,

    largest_total_prov,
    le_largest_total_prov,
    de_largest_total_prov,
    largest_total_value,
    largest_total_percent,
  };
};

const get_color_scale = (data) =>
  _.chain(data)
    .last()
    .values()
    .max()
    .thru((last_year_max) =>
      scaleLinear().domain([0, last_year_max]).range([0.2, 1])
    )
    .value();
const TransferPaymentsByRegionGraph = ({ data, alt_totals_by_year }) => (
  <Canada
    graph_args={{
      data,
      alt_totals_by_year,
      color_scale: get_color_scale(data),
      years: tp_by_region_years,
      formatter: formats.compact2_raw,
    }}
  />
);

class TPMap extends React.Component {
  render() {
    const { title, subject, calculations, footnotes, sources, datasets } =
      this.props;

    const { table: transfer_payments_table } = calculations;

    const transfer_payments_by_prov =
      transfer_payments_table.sum_cols_by_grouped_data(
        tp_by_region_years,
        "region_code",
        subject
      );

    const transfer_payment_data = group_prov_data_by_year(
      transfer_payments_by_prov
    );

    const format_a11y_data = (data) =>
      _.map(data, (prov_data, prov_code) => ({
        prov: provinces[prov_code].text,
        ..._.chain(tp_by_region_years).zip(prov_data).fromPairs().value(),
      }));

    const text_args = get_text_args(subject, transfer_payment_data);

    return (
      <StdPanel {...{ title, footnotes, sources, datasets }}>
        <Col size={12} isText>
          <TM k="tp_by_region_text" args={text_args} />
          {!is_a11y_mode && <TM k="tp_by_region_graph_usage" />}
        </Col>
        <Col size={12} isGraph>
          {!is_a11y_mode && (
            <TransferPaymentsByRegionGraph data={transfer_payment_data} />
          )}
          {is_a11y_mode && (
            <Fragment>
              <DisplayTable
                column_configs={{
                  prov: {
                    index: 0,
                    is_searchable: true,
                    header: text_maker("geo_region"),
                  },
                  ..._.chain(tp_by_region_years)
                    .map((yr, idx) => [
                      yr,
                      {
                        index: idx + 1,
                        header: run_template(yr),
                        formatter: (value) =>
                          formats.compact2_written_raw(value),
                      },
                    ])
                    .fromPairs()
                    .value(),
                }}
                data={format_a11y_data(transfer_payments_by_prov)}
              />
            </Fragment>
          )}
        </Col>
      </StdPanel>
    );
  }
}

export const declare_tp_by_region_panel = () =>
  declare_panel({
    panel_key: "tp_by_region",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["orgTransferPaymentsRegion"],
      get_dataset_keys: () => ["transfer_payments_by_region"],
      get_title: () => text_maker("tp_by_region_title"),
      calculate: ({ subject, tables }) => {
        const { orgTransferPaymentsRegion } = tables;

        if (
          subject.subject_type === "dept" &&
          !_.has(orgTransferPaymentsRegion.depts, subject.id)
        ) {
          return false;
        }

        return { table: orgTransferPaymentsRegion };
      },
      render: ({
        title,
        subject,
        calculations,
        footnotes,
        sources,
        datasets,
      }) => (
        <TPMap
          {...{ title, subject, calculations, footnotes, sources, datasets }}
        />
      ),
    }),
  });
