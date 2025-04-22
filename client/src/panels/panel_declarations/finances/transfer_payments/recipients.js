import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { useState } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { DisplayTable, Tabs } from "src/components/index";

import { RecipientsGeneralStatsDataStore } from "src/models/recipients/RecipientsGeneralStatsDataStore";

import { newIBLightCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { WrappedNivoTreemap } from "src/charts/wrapped_nivo/index";

import { text_maker } from "./gnc_text_provider";

const RecipientTable = ({ filtered_data }) => {
  const table_data = _.map(
    filtered_data,
    ({ recipient, total_exp, num_transfer_payments }) => ({
      recipient,
      total_exp,
      num_transfer_payments,
    })
  );

  const column_configs = {
    recipient: {
      index: 0,
      header: "Recipients",
      is_searchable: true,
    },
    num_transfer_payments: {
      index: 1,
      header: "# of Transfer Payments",
    },
    total_exp: {
      index: 2,
      header: "Total",
      formatter: "compact2_written",
      is_summable: true,
    },
  };

  return <DisplayTable data={table_data} column_configs={column_configs} />;
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

const RecipientsPanel = ({ calculations }) => {
  const { data, tab_keys } = calculations;

  const [tab_key, set_tab_key] = useState(_.last(tab_keys));

  const filtered_data = _.chain(data)
    .filter((row) => row.year === tab_key)
    .orderBy("total_exp", "desc")
    .take(10)
    .value();

  const summary = (
    <div className="row align-items-center">
      <div className="col-12 col-lg-6">
        <RecipientTable filtered_data={filtered_data} />
      </div>
      <div className="col-12 col-lg-6">
        <RecipientTreeMap filtered_data={filtered_data} />
      </div>
    </div>
  );

  return (
    <Tabs
      tabs={_.chain(tab_keys)
        .map((year) => [year, formats.year_to_fiscal_year(year)])
        .fromPairs()
        .value()}
      open_tab_key={tab_key}
      tab_open_callback={set_tab_key}
    >
      {summary}
    </Tabs>
  );
};

export const declare_recipients_panel = () =>
  declare_panel({
    panel_key: "recipients",
    subject_types: ["dept"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_recipients_general_stats"],
      calculate: ({ subject }) => {
        const data = RecipientsGeneralStatsDataStore.lookup(subject.id).data;

        const tab_keys = _.chain(data).map("year").uniq().value();

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
