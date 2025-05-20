import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment, useState } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { DisplayTable, StatelessModal, Tabs } from "src/components/index";

import { RecipientSummary } from "src/models/recipients/RecipientsSummaryDataStore";

import { newIBLightCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { WrappedNivoTreemap } from "src/charts/wrapped_nivo/index";

import { secondaryColor } from "src/style_constants/index";

import { text_maker, TM } from "./gnc_text_provider";

const { year_to_fiscal_year } = formats;

const no_data_or_na_to_null = (value) =>
  value === "Not Available" || value === null ? "-" : value;

const RecipientTable = ({ filtered_data }) => {
  const [open_recipient, set_open_recipient] = useState(null);

  const cleaned_data = filtered_data.map((row, idx) => ({
    ...row,
    id: idx.toString(),
  }));

  const get_tf_by_id = (id) => {
    const row = cleaned_data.find((row) => row.id === id);
    const transfer_payments = row ? row.transfer_payments || [] : [];

    return _.chain(transfer_payments)
      .map(({ program, city, province, country, expenditure }) => ({
        program,
        city: no_data_or_na_to_null(city),
        province: no_data_or_na_to_null(province),
        country: no_data_or_na_to_null(country),
        expenditure,
      }))
      .orderBy("expenditure", "desc")
      .value();
  };

  const get_recipient_by_id = (id) => {
    const row = cleaned_data.find((row) => row.id === id);
    return row ? row.recipient : null;
  };

  const table_data = _.chain(cleaned_data)
    .map(({ recipient, total_exp, id }) => ({
      recipient,
      total_exp,
      id: id,
    }))
    .value();

  const column_configs_recipients = {
    recipient: {
      index: 0,
      header: "Recipients",
    },
    id: {
      index: 1,
      header: "Transfer Payments",
      formatter: (id) => (
        <button
          className="btn btn-link"
          onClick={() => set_open_recipient(id)}
          style={{ color: secondaryColor }}
        >
          {get_tf_by_id(id).length}
        </button>
      ),
      plain_formatter: (id) => get_tf_by_id(id).length,
    },
    total_exp: {
      index: 2,
      header: "Total Payment Received",
      formatter: "compact2_written",
      is_summable: true,
    },
  };

  const column_configs_tf = {
    program: {
      index: 0,
      header: "Transfer Payment Program",
    },
    city: { index: 1, header: "City" },
    province: {
      index: 2,
      header: "Province",
    },
    country: {
      index: 3,
      header: "Country",
    },
    expenditure: {
      index: 4,
      header: "Payment",
      formatter: "compact2_written",
      is_summable: true,
    },
  };

  return (
    <Fragment>
      <DisplayTable
        data={table_data}
        column_configs={column_configs_recipients}
      />
      <StatelessModal
        show={!_.isNull(open_recipient)}
        on_close_callback={() => set_open_recipient(null)}
        additional_dialog_class={"modal-responsive"}
        title={text_maker("transfer_payment_table_title", {
          recipient: get_recipient_by_id(open_recipient),
        })}
      >
        {!_.isNull(open_recipient) && (
          <DisplayTable
            data={get_tf_by_id(open_recipient)}
            column_configs={column_configs_tf}
          />
        )}
      </StatelessModal>
    </Fragment>
  );
};

const RecipientTreeMap = ({ filtered_data }) => {
  const color_scale = scaleOrdinal().range(newIBLightCategoryColors);

  const top_ten_data = {
    name: "root",
    color: "white",
    children: _.map(filtered_data, (data, index) => ({
      id: index,
      recipient: data.recipient,
      year: data.year,
      expenditure: data.total_exp,
    })),
  };

  return (
    <WrappedNivoTreemap
      data={top_ten_data}
      colorScale={(d) => color_scale(d.expenditure)}
      value_string="expenditure"
      formatter={formats.compact1}
      label_id="recipient"
    />
  );
};

const RecipientsPanel = ({ subject, calculations }) => {
  const { data, tab_keys } = calculations;

  const { recipient_exp_summary, recipient_overview } = data;

  const [tab_key, set_tab_key] = useState(_.last(tab_keys));

  const total_exp = _.chain(recipient_overview)
    .filter((row) => row.year === tab_key)
    .map("total_tf_exp")
    .value();

  const filtered_data = _.chain(recipient_exp_summary)
    .filter((row) => row.year === tab_key)
    .value();

  return (
    <Tabs
      tabs={_.chain(tab_keys)
        .map((year) => [year, year_to_fiscal_year(year)])
        .fromPairs()
        .value()}
      open_tab_key={tab_key}
      tab_open_callback={set_tab_key}
    >
      <div className="medium-panel-text text">
        <TM
          k={`recipient_${subject.subject_type}_text`}
          args={{ year: year_to_fiscal_year(tab_key), subject, total_exp }}
        />
      </div>
      <div className="row align-items-center">
        <div className="col-12 col-lg-6">
          <RecipientTable filtered_data={filtered_data} />
        </div>
        <div
          className="col-12 col-lg-6"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <RecipientTreeMap filtered_data={filtered_data} />
        </div>
      </div>
    </Tabs>
  );
};

export const declare_recipients_panel = () =>
  declare_panel({
    panel_key: "recipients",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_recipients_general_stats"],
      get_dataset_keys: () => ["recipients"],
      calculate: ({ subject }) => {
        const data = RecipientSummary.lookup(subject.id);

        const tab_keys = _.chain(data.recipient_exp_summary)
          .map("year")
          .uniq()
          .value();

        return { data, tab_keys };
      },
      get_title: () => text_maker("recipients_title"),
      render({ title, subject, sources, calculations }) {
        return (
          <InfographicPanel {...{ title, sources }}>
            <RecipientsPanel subject={subject} calculations={calculations} />
          </InfographicPanel>
        );
      },
    }),
  });
