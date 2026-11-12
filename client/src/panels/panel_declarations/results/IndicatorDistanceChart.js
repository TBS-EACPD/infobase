import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { create_text_maker_component } from "src/components/index";

import { visible_distance_bins } from "./indicator_distance";
import { IndicatorDistanceHeatmap } from "./IndicatorDistanceHeatmap";

import text from "./IndicatorDistanceChart.yaml";

import "./IndicatorDistanceChart.scss";

const { text_maker, TM } = create_text_maker_component(text);

const tone_class = {
  short: "results-icon-array-fail",
  met: "results-icon-array-pass",
  exceeded: "results-icon-array-na",
};

const Legend = () => (
  <div className="indicator-distance-chart__legend">
    {_.map(
      [
        ["short", "distance_legend_short"],
        ["met", "distance_legend_met"],
        ["exceeded", "distance_legend_exceeded"],
      ],
      ([tone, label_key]) => (
        <div key={tone} className="indicator-distance-chart__legend-item">
          <div
            aria-hidden="true"
            className={classNames(
              "indicator-distance-chart__swatch",
              tone_class[tone]
            )}
          />
          <span>{text_maker(label_key)}</span>
        </div>
      )
    )}
  </div>
);

export const IndicatorDistanceChart = ({
  year,
  rows,
  included_count,
  total_count,
}) => {
  const bins = visible_distance_bins(rows);

  return (
    <div className="indicator-distance-chart">
      <div
        id="indicator-distance-chart-title"
        className="medium-panel-text indicator-distance-chart__title"
      >
        <TM k="distance_chart_title" args={{ year }} />
      </div>
      <div className="medium-panel-text indicator-distance-chart__note">
        <TM k="distance_chart_note" />
      </div>
      <div className="medium-panel-text indicator-distance-chart__counts">
        <TM
          k="distance_chart_counts"
          args={{ included: included_count, total: total_count }}
        />
      </div>
      {included_count > 0 && (
        <Fragment>
          <div className="medium-panel-text indicator-distance-chart__title indicator-distance-heatmap__heading">
            <TM k="distance_heatmap_colours_heading" />
          </div>
          <Legend />
          <IndicatorDistanceHeatmap rows={rows} bins={bins} variant="colours" />
          <div className="medium-panel-text indicator-distance-chart__title indicator-distance-heatmap__heading indicator-distance-heatmap__heading--follow">
            <TM k="distance_heatmap_scale_heading" />
          </div>
          <IndicatorDistanceHeatmap rows={rows} bins={bins} variant="scale" />
          <table
            className="indicator-distance-chart__sr-only"
            aria-labelledby="indicator-distance-chart-title"
          >
            <thead>
              <tr>
                <th scope="col">{text_maker("distance_result_column")}</th>
                {_.map(bins, (bin) => (
                  <th key={bin.id} scope="col">
                    {text_maker(bin.label_key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {_.map(rows, (row) => (
                <tr key={row.id}>
                  <th scope="row">{row.name}</th>
                  {_.map(bins, (bin) => (
                    <td key={bin.id}>{row.counts[bin.id]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Fragment>
      )}
    </div>
  );
};
