import _ from "lodash";
import React, { Fragment } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  DisplayTable,
  GraphOverlay,
  LeafSpinner,
} from "src/components/index";

import { useProgramSobjs } from "src/models/finance/queries";

import { formats } from "src/core/format";

import { StandardLegend } from "src/charts/legends/index";

import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index";

import {
  highlightColor,
  secondaryColor,
  textColor,
} from "src/style_constants/index";

import text from "./spend_bar.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const common_cal = (subject, data) => {
  const graph_data = _.chain(data)
    .filter((row) => row.pa_exp_last_year || row.pa_rev_last_year)
    .filter((row) => row.so_num < 19)
    .map(({ so_num, pa_exp_last_year, pa_rev_last_year }) => ({
      id: so_num,
      Expenditure: pa_exp_last_year,
      Offset: pa_rev_last_year,
      net: pa_exp_last_year + pa_rev_last_year,
      label: text_maker(`SOBJ${so_num}`),
    }))
    .filter((row) => row.Expenditure || row.Offset)
    .orderBy("id", "desc")
    .compact()
    .value();

  const custom_table_data = _.chain(graph_data)
    .map(({ id, label, Expenditure, Offset, net }) => ({
      id,
      label,
      Expenditure,
      Offset,
      net,
    }))
    .sortBy("id")
    .value();

  const column_configs = {
    id: {
      index: 0,
      header: "ID",
    },
    label: {
      index: 1,
      header: "Standard Objects",
      is_searchable: true,
    },
    Expenditure: {
      index: 2,
      header: text_maker("expenditure"),
      is_summable: true,
      formatter: "dollar",
    },
    Offset: {
      index: 3,
      header: text_maker("offset"),
      is_summable: true,
      formatter: "dollar",
    },
    net: {
      index: 4,
      header: "Net",
      is_summable: true,
      formatter: "dollar",
    },
  };

  const total_spent = _.sumBy(graph_data, "net");

  const top_so_exp = _.maxBy(graph_data, "Expenditure");

  const top_so_rev = _.minBy(graph_data, "Offset");

  console.log(top_so_rev);

  const top_so_pct = top_so_exp.net / total_spent;

  const text_calculations = {
    subject,
    total_spent,
    top_so_exp_name: top_so_exp.label,
    top_so_exp: top_so_exp.Expenditure,
    top_so_rev_name: top_so_rev.label,
    top_so_rev: top_so_rev.Offset,
    top_so_pct,
    net_exp: _.sumBy(graph_data, "net"),
  };

  return {
    graph_data,
    text_calculations,
    custom_table_data,
    column_configs,
  };
};

const ProgramSobjSummary = ({ subject }) => {
  const { loading, data } = useProgramSobjs({
    programId: subject.id,
  });

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const formatter_compact1 = formats.compact1_raw;

  const formatter_compact2 = formats.compact2_raw;

  const { graph_data, text_calculations, custom_table_data, column_configs } =
    common_cal(subject, data.program_sobjs);

  // Increase height of the graph region for y-axis labels to have sufficient room
  // This is required to corretly display the labels when too many programs are present
  const divHeight = _.chain([1000 * (graph_data.length / 30) * 2, 100]) // 100 is the minimum graph height
    .max()
    .thru((maxVal) => [maxVal, 500]) // 1200 is the max graph height
    .min()
    .value();

  const markers = _.map(graph_data, ({ label, net }) => ({
    axis: "y",
    value: label,
    lineStyle: { strokeWidth: 0 },
    textStyle: {
      fill: net < 0 ? highlightColor : textColor,
      fontSize: "11px",
    },
    legend: formatter_compact2(net),
    legendOffsetX: -60,
    legendOffsetY: Math.max(-(divHeight / (3.3 * graph_data.length)), -18), // Math.max so that there would be a set value for when the graph has one bar/data point
  }));

  const rev_data_available = !_.chain(graph_data)
    .filter((row) => row.Offset)
    .isEmpty()
    .value();

  const exp_data_available = !_.chain(graph_data)
    .filter((row) => row.Expenditure)
    .isEmpty()
    .value();

  const exp_legend_items = exp_data_available
    ? [
        {
          id: "Expenditure",
          label: text_maker("expenditure"),
          color: secondaryColor,
        },
      ]
    : [];

  const rev_legend_items = rev_data_available
    ? [
        {
          id: "Offset",
          label: text_maker("offset"),
          color: highlightColor,
        },
      ]
    : [];

  const legend_items = rev_legend_items.concat(exp_legend_items);

  return (
    <Fragment>
      <TM k="program_spending_revenue_areas_text" args={text_calculations} />
      <div
        className="centerer mrgn-bttm-md"
        style={{ padding: "10px 25px 10px 30px" }}
      >
        <StandardLegend
          legendListProps={{
            items: legend_items,
            isHorizontal: true,
            checkBoxProps: { isSolidBox: true },
          }}
        />
      </div>
      <div>
        <GraphOverlay>
          <WrappedNivoHBar
            data={graph_data}
            keys={["Expenditure", "Offset"]}
            indexBy="label"
            colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
            graph_height={divHeight}
            margin={{
              top: 0,
              right: 100,
              bottom: 50,
              left: 220,
            }}
            bttm_axis={{
              tickSize: 5,
              tickPadding: 5,
              tickValues: 6,
              tickRotation: -20,
              format: (d) => formatter_compact1(d),
            }}
            markers={markers}
            custom_table={
              <DisplayTable
                column_configs={column_configs}
                data={custom_table_data}
              />
            }
          />
        </GraphOverlay>
      </div>
    </Fragment>
  );
};

export const declare_spend_bar_panel = () =>
  declare_panel({
    panel_key: "spend_bar",
    subject_types: ["program"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["programSobjs"],
      get_dataset_keys: () => ["program_standard_objects"],
      get_title: () => text_maker("top_spending_areas_title"),
      render: ({ title, subject, footnotes, sources, datasets }) => {
        return (
          <InfographicPanel {...{ title, footnotes, sources, datasets }}>
            <ProgramSobjSummary subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
