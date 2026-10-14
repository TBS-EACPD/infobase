import _ from "lodash";
import React from "react";


import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { useIndicatorHistory } from "src/models/results/queries";

import { formats } from "src/core/format";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index";

import { build_indicator_history_chart } from "./indicator_distance";
import { result_docs } from "./results_common";

import text from "./IndicatorHistoryChart.yaml";

import "./IndicatorHistoryChart.scss";

const { text_maker, TM } = create_text_maker_component(text);

const SERIES_ORDER = ["minimum", "maximum", "exact", "actual"];

const label_key = {
  minimum: "indicator_history_target_minimum",
  maximum: "indicator_history_target_maximum",
  exact: "indicator_history_target_exact",
  actual: "indicator_history_actual",
};

const series_color = {
  minimum: "#206bbd",
  maximum: "#e89a40",
  exact: "#206bbd",
  actual: "#4abbc4",
};

const unit_formatter = {
  percent: formats.result_percentage,
  dollar: formats.dollar_raw,
  num: formats.result_num,
};

const y_axis_key = {
  percent: "indicator_history_y_percent",
  dollar: "indicator_history_y_dollars",
  num: "indicator_history_y_number",
};

const year_for_doc = (doc) => result_docs[doc] && result_docs[doc].year;

export const IndicatorHistoryChart = ({ stable_id }) => {
  const { loading, data } = useIndicatorHistory({ stableId: stable_id });

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const chart = build_indicator_history_chart(_.compact(data), year_for_doc);
  if (!chart) {
    return null;
  }

  const lines = _.compact(
    _.map(SERIES_ORDER, (key) => {
      const values = chart.series[key];
      if (!values) {
        return null;
      }
      return {
        id: text_maker(label_key[key]),
        data: _.map(chart.years, (year, index) => ({
          x: year,
          y: values[index],
        })),
      };
    })
  );
  const color_for_id = _.fromPairs(
    _.map(lines, (line) => [
      line.id,
      series_color[
        _.find(SERIES_ORDER, (key) => text_maker(label_key[key]) === line.id)
      ],
    ])
  );
  const raw_data = _.filter(_.flatMap(lines, (line) => _.map(line.data, "y")), _.isNumber);

  return (
    <div className="indicator-history-chart">
      <div className="medium-panel-text indicator-history-chart__title">
        <TM k="indicator_history_title" />
      </div>
      <WrappedNivoLine
        data={lines}
        raw_data={raw_data}
        colors={({ id }) => color_for_id[id]}
        is_money={false}
        text_formatter={unit_formatter[chart.unit]}
        enablePoints={true}
        graph_height="280px"
        margin={{ top: 48, right: 24, bottom: 64, left: 76 }}
        bttm_axis={{
          tickSize: 7,
          tickPadding: 8,
          legend: text_maker("indicator_history_x_axis"),
          legendOffset: 44,
          legendPosition: "middle",
        }}
        left_axis={{
          legend: text_maker(y_axis_key[chart.unit]),
          legendOffset: -60,
          legendPosition: "middle",
        }}
        legends={[
          {
            anchor: "top-left",
            direction: "row",
            translateY: -36,
            itemWidth: 150,
            itemHeight: 16,
            symbolSize: 10,
            symbolShape: "circle",
          },
        ]}
      />
      {!_.isEmpty(chart.non_numeric_years) && (
        <div className="medium-panel-text indicator-history-chart__note">
          <TM
            k="indicator_history_non_numeric"
            args={{ years: chart.non_numeric_years.join(", ") }}
          />
        </div>
      )}
    </div>
  );
};
