import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { create_text_maker_component } from "src/components/index";

import { visible_distance_bins } from "./indicator_distance";

import text from "./IndicatorDistanceChart.yaml";

import "./IndicatorDistanceChart.scss";

const { text_maker, TM } = create_text_maker_component(text);

const NAME_COLUMN = "16rem";
const BIN_COLUMN = "1.85rem";

const tone_class = {
  short: "results-icon-array-fail",
  met: "results-icon-array-pass",
  exceeded: "results-icon-array-na",
};

const count_text_class = {
  short: "indicator-distance-chart__count--short",
  met: "indicator-distance-chart__count--met",
  exceeded: "indicator-distance-chart__count--exceeded",
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
          <Legend />
          <div className="indicator-distance-chart__scroll">
            <div
              aria-hidden="true"
              className="indicator-distance-chart__axis"
              style={{
                gridTemplateColumns: `${NAME_COLUMN} repeat(${bins.length}, ${BIN_COLUMN})`,
              }}
            >
              <div className="indicator-distance-chart__axis-name">
                {text_maker("distance_result_column")}
              </div>
              {_.map(bins, (bin) => (
                <div
                  key={bin.id}
                  className="indicator-distance-chart__axis-slot"
                >
                  {bin.show_axis_label && (
                    <span className="indicator-distance-chart__axis-label">
                      {text_maker(bin.label_key)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <table
              className="indicator-distance-chart__table"
              aria-labelledby="indicator-distance-chart-title"
            >
              <colgroup>
                <col style={{ width: NAME_COLUMN }} />
                {_.map(bins, (bin) => (
                  <col key={bin.id} style={{ width: BIN_COLUMN }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="indicator-distance-chart__result-header"
                  >
                    <span className="indicator-distance-chart__sr-only">
                      {text_maker("distance_result_column")}
                    </span>
                  </th>
                  {_.map(bins, (bin) => (
                    <th
                      key={bin.id}
                      scope="col"
                      className="indicator-distance-chart__bin-header"
                    >
                      <span className="indicator-distance-chart__sr-only">
                        {text_maker(bin.label_key)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {_.map(rows, (row) => (
                  <tr key={row.id}>
                    <th
                      scope="row"
                      className="indicator-distance-chart__result"
                    >
                      {row.name}
                    </th>
                    {_.map(bins, (bin) => {
                      const count = row.counts[bin.id];
                      const label = text_maker(bin.label_key);
                      return (
                        <td
                          key={bin.id}
                          className="indicator-distance-chart__cell"
                        >
                          {count > 0 && (
                            <span
                              className={classNames(
                                "indicator-distance-chart__count",
                                count_text_class[bin.tone],
                                tone_class[bin.tone]
                              )}
                              title={text_maker("distance_cell_title", {
                                label,
                                count,
                              })}
                            >
                              {count}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      )}
    </div>
  );
};
