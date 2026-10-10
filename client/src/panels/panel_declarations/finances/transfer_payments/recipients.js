import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment, useState, useEffect } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  DisplayTable,
  LeafSpinner,
  StatelessModal,
  Tabs,
} from "src/components/index";

import { create_footnote } from "src/models/footnotes/footnotes";

import {
  useRecipientSummaryGov,
  useRecipientSummaryOrg,
  useRecipientDetailsGov,
  useRecipientDetailsOrg,
} from "src/models/recipients/queries";

import { RecipientReportYears } from "src/models/recipients/RecipientsSummaryDataStore";

import { newIBLightCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { WrappedNivoTreemap } from "src/charts/wrapped_nivo/index";

import { secondaryColor } from "src/style_constants/index";

import { text_maker, TM } from "./gnc_text_provider";

const { year_to_fiscal_year } = formats;

const PAGE_SIZE = 50;

const RecipientDetailTable = ({
  loading,
  data,
  open_recipient,
  page,
  on_page_change,
  num_table_rows,
}) => {
  const all_other_recipients_row = "11";
  const isSpecialRecipient = open_recipient === all_other_recipients_row;

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const modal_data = isSpecialRecipient
    ? _.chain(data)
        .map((row) =>
          _.pick(row, [
            "city",
            "province",
            "country",
            "expenditure",
            "transfer_payment",
            "recipient",
          ])
        )
        .value()
    : _.map(data, (row) =>
        _.pick(row, [
          "city",
          "province",
          "country",
          "expenditure",
          "transfer_payment",
        ])
      );

  const common_column_configs_tp = {
    transfer_payment: {
      index: 1,
      header: text_maker("transfer_payment"),
    },
    city: { index: 2, header: text_maker("city") },
    province: { index: 3, header: text_maker("province") },
    country: { index: 4, header: text_maker("country") },
    expenditure: {
      index: 5,
      header: text_maker("payment_received"),
      formatter: "compact2_written",
    },
  };

  const modalColumns = isSpecialRecipient
    ? {
        recipient: {
          index: 0,
          header: text_maker("recipient"),
        },
        ...common_column_configs_tp,
      }
    : common_column_configs_tp;

  return (
    <DisplayTable
      data={modal_data}
      column_configs={modalColumns}
      recipient_page={page}
      recipient_on_page_change={on_page_change}
      num_table_rows={num_table_rows}
      recipient_page_size={PAGE_SIZE}
      show_sort={false}
    />
  );
};

const GovRecipientDetailTable = ({
  tab_key,
  open_recipient,
  num_table_rows,
}) => {
  const [page, set_page] = useState(0);

  useEffect(() => {
    set_page(0);
  }, [tab_key, open_recipient]);

  const { loading, data } = useRecipientDetailsGov({
    year: tab_key,
    row_id: open_recipient,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  return (
    <RecipientDetailTable
      loading={loading}
      data={data}
      open_recipient={open_recipient}
      page={page}
      on_page_change={set_page}
      num_table_rows={num_table_rows}
    />
  );
};

const DeptRecipientDetailTable = ({
  tab_key,
  open_recipient,
  subject,
  num_table_rows,
}) => {
  const [page, set_page] = useState(0);

  useEffect(() => {
    set_page(0);
  }, [tab_key, open_recipient]);

  const { loading, data } = useRecipientDetailsOrg({
    year: tab_key,
    row_id: open_recipient,
    org_id: subject.id,
    offset: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  return (
    <RecipientDetailTable
      loading={loading}
      data={data}
      open_recipient={open_recipient}
      page={page}
      on_page_change={set_page}
      num_table_rows={num_table_rows}
    />
  );
};

const RecipientTable = ({ data, table_data, subject, tab_key }) => {
  const [open_recipient, set_open_recipient] = useState(null);

  const get_recipient_by_id = (id) => {
    if (!id) return null;
    const row = data.find((row) => row.row_id === id);
    return row ? row.recipient : null;
  };

  const get_tp_by_id = (id) => {
    if (!id) return [];
    const tp_rows = _.chain(data)
      .find((row) => row.row_id === id)
      .get("num_transfer_payments")
      .value();
    return tp_rows;
  };

  const column_configs_recipients = {
    recipient: { index: 0, header: text_maker("recipient") },
    id: {
      index: 1,
      header: text_maker("transfer_payment"),
      formatter: (id) => (
        <button
          className="btn btn-link"
          onClick={() => set_open_recipient(id)}
          style={{ color: secondaryColor }}
        >
          {get_tp_by_id(id)}
        </button>
      ),
      plain_formatter: (id) => get_tp_by_id(id),
    },
    total_exp: {
      index: 2,
      header: text_maker("payment_received"),
      formatter: "compact2_written",
      is_summable: true,
    },
  };

  const showModal = open_recipient !== null;

  return (
    <Fragment>
      <DisplayTable
        data={table_data}
        column_configs={column_configs_recipients}
      />
      <StatelessModal
        show={showModal}
        on_close_callback={() => set_open_recipient(null)}
        additional_dialog_class={"modal-responsive"}
        title={text_maker("transfer_payment_table_title", {
          recipient: get_recipient_by_id(open_recipient),
        })}
      >
        {showModal && subject.subject_type === "gov" && (
          <GovRecipientDetailTable
            subject={subject}
            tab_key={tab_key}
            open_recipient={open_recipient}
            num_table_rows={get_tp_by_id(open_recipient)}
          />
        )}
        {showModal && subject.subject_type === "dept" && (
          <DeptRecipientDetailTable
            subject={subject}
            tab_key={tab_key}
            open_recipient={open_recipient}
            num_table_rows={get_tp_by_id(open_recipient)}
          />
        )}
      </StatelessModal>
    </Fragment>
  );
};

const RecipientTreeMap = ({ table_data }) => {
  const color_scale = scaleOrdinal().range(newIBLightCategoryColors);

  const top_ten_data = {
    name: "root",
    color: "white",
    children: _.take(table_data, 10),
  };

  return (
    <WrappedNivoTreemap
      data={top_ten_data}
      colorScale={(d) => color_scale(d.total_exp)}
      value_string="total_exp"
      formatter={formats.compact1}
      label_id="recipient"
    />
  );
};

const RecipientPanelContent = ({ subject, tab_key }) => {
  const useRecipientSummary = (subject) =>
    ({
      gov: useRecipientSummaryGov({ year: tab_key }),
      dept: useRecipientSummaryOrg({ id: subject.id, year: tab_key }),
    }[subject.subject_type]);

  const { loading, data } = useRecipientSummary(subject);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const { total_exp, top_ten } = data;

  const table_data = _.map(top_ten, (data) => ({
    id: data.row_id,
    recipient: data.recipient,
    total_exp: data.total_exp,
  }));

  return (
    <div>
      <div className="medium-panel-text text">
        <TM
          k={`recipient_${subject.subject_type}_text`}
          args={{ year: year_to_fiscal_year(tab_key), subject, total_exp }}
        />
      </div>
      <div className="row align-items-center">
        <div className="col-12 col-lg-6">
          <RecipientTable
            data={top_ten}
            table_data={table_data}
            subject={subject}
            tab_key={tab_key}
          />
        </div>
        <div
          className="col-12 col-lg-6"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <RecipientTreeMap table_data={table_data} />
        </div>
      </div>
    </div>
  );
};

const RecipientsPanel = ({ subject }) => {
  const tab_keys = RecipientReportYears.lookup(subject.id).report_years;

  const [tab_key, set_tab_key] = useState(_.last(tab_keys));

  return (
    <Tabs
      tabs={_.chain(tab_keys)
        .map((year) => [year, year_to_fiscal_year(year)])
        .fromPairs()
        .value()}
      open_tab_key={tab_key}
      tab_open_callback={set_tab_key}
    >
      <RecipientPanelContent subject={subject} tab_key={tab_key} />
    </Tabs>
  );
};

export const declare_recipients_panel = () =>
  declare_panel({
    panel_key: "recipients",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_recipients"],
      get_dataset_keys: () => ["recipients"],
      calculate: ({ subject }) => {
        switch (subject.subject_type) {
          case "gov":
            return true;
          case "dept":
            return subject.has_data("recipients");
        }
      },
      get_title: () => text_maker("recipients_title"),
      render({ title, subject, sources, footnotes }) {
        footnotes = _.concat(
          create_footnote({
            id: "recipient_name_mapping_footnote",
            subject_type: subject.subject_type,
            subject_id: subject.id,
            text: text_maker("recipient_name_mapping_footnote"),
            topic_keys: ["EXP"],
          }),
          create_footnote({
            id: "recipient_name_footnote",
            subject_type: subject.subject_type,
            subject_id: subject.id,
            text: text_maker("recipient_name_footnote"),
            topic_keys: ["EXP"],
          }),
          create_footnote({
            id: "payments_under_100k_footnote",
            subject_type: subject.subject_type,
            subject_id: subject.id,
            text: text_maker("payments_under_100k_footnote"),
            topic_keys: ["EXP"],
          })
        );
        return (
          <InfographicPanel {...{ title, sources, footnotes }}>
            <RecipientsPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
