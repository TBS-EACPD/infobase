import _ from "lodash";
import React, { useMemo } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  DisplayTable,
  LeafSpinner,
} from "src/components/index";

import { calculate_top_spending_areas_from_finance_data } from "src/models/finances/sobj_calculations";
import { useProgramSobjsFinanceData } from "src/models/finances/useProgramSobjsFinanceData";

import { formats } from "src/core/format";

import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index";

import { highlightColor, secondaryColor, textColor } from "src/style_constants";

import text from "./top_spending_areas.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const render_w_options =
  ({ text_key }) =>
  ({ title, calculations, footnotes, sources, datasets }) => {
    const { text_calculations, rows_by_so } = calculations;

    const graph_data = _.chain(rows_by_so)
      .map((d) => ({
        label: d["label"],
        id: d["so_num"],
        Expenditure: d["value"],
      }))
      .orderBy("id", "desc")
      .value();

    const divHeight = _.chain([1000 * (graph_data.length / 30) * 2, 100])
      .max()
      .thru((maxVal) => [maxVal, 500])
      .min()
      .value();

    const markers = _.map(graph_data, ({ label, value }) => ({
      axis: "y",
      value: label,
      lineStyle: { strokeWidth: 0 },
      textStyle: {
        fill: value < 0 ? highlightColor : textColor,
        fontSize: "11px",
      },
      legend: formats.compact1_raw(value),
      legendOffsetX: -60,
      legendOffsetY: Math.max(-(divHeight / (3.3 * graph_data.length)), -18),
    }));

    const custom_table_data = _.chain(rows_by_so)
      .map((d) => ({
        label: d["label"],
        so_num: d["so_num"],
        value: d["value"],
      }))
      .sortBy("so_num")
      .value();

    const column_configs = {
      so_num: {
        index: 0,
        header: "ID",
      },
      label: {
        index: 1,
        header: text_maker("sos"),
      },
      value: {
        index: 2,
        header: text_maker("expenditures"),
        is_summable: true,
        formatter: "dollar",
      },
    };

    return (
      <InfographicPanel {...{ title, footnotes, sources, datasets }}>
        <TM k={text_key} args={text_calculations} />
        <WrappedNivoHBar
          data={graph_data}
          keys={["Expenditure"]}
          indexBy="label"
          colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
          margin={{
            top: 0,
            right: 100,
            bottom: 50,
            left: 250,
          }}
          bttm_axis={{
            tickSize: 5,
            tickPadding: 5,
            tickValues: 6,
            tickRotation: -20,
            format: (d) => formats.compact1_raw(d),
          }}
          markers={markers}
          custom_table={
            <DisplayTable
              column_configs={column_configs}
              data={custom_table_data}
            />
          }
        />
      </InfographicPanel>
    );
  };

const TopSpendingAreasContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } = useProgramSobjsFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_top_spending_areas_from_finance_data(
      subject,
      finance_data
    );
  }, [loading, subject, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return render_w_options({ text_key: "program_top_spending_areas_text" })({
    ...props,
    title: text_maker("top_spending_areas_title"),
    calculations,
  });
};

export const declare_top_spending_areas_panel = () =>
  declare_panel({
    panel_key: "top_spending_areas",
    subject_types: ["program"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_standard_objects"],
      get_title: () => text_maker("top_spending_areas_title"),
      calculate: () => true,
      render: (props) => <TopSpendingAreasContainer {...props} />,
    }),
  });
