import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import {
  create_text_maker_component,
  LeafSpinner,
} from "src/components/index";

import { useGovDrrIndicators } from "src/models/results/queries";

import {
  DISTANCE_BINS,
  count_indicators_by_distance,
} from "./indicator_distance";
import { get_year_for_doc_key } from "./results_common";

import text from "./IndicatorDistanceChart.yaml";

import "./IndicatorDistanceChart.scss";
import "./IndicatorDistanceHistogram.scss";

const { text_maker, TM } = create_text_maker_component(text);

const BIN_COLUMN = "2rem";

const tone_class = {
  short: "results-icon-array-fail",
  met: "results-icon-array-pass",
  exceeded: "results-icon-array-na",
};

const nice_axis_max = (value) => {
  if (value <= 4) {
    return Math.max(value, 1);
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
};

const format_tick = (tick) =>
  Number.isInteger(tick) ? String(tick) : tick.toFixed(1);

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

const Histogram = ({ year, counts }) => {
  const bins = DISTANCE_BINS;
  const max_count = _.max(_.values(counts)) || 0;
  const axis_max = nice_axis_max(max_count);
  const ticks = _.map([0, 0.25, 0.5, 0.75, 1], (share) => share * axis_max);

  return (
    <Fragment>
      <Legend />
      <div className="indicator-distance-histogram__scroll">
        <div
          className="indicator-distance-histogram__figure"
          aria-hidden="true"
        >
          <div className="indicator-distance-histogram__y-label">
            {text_maker("distance_histogram_y_axis")}
          </div>
          <div className="indicator-distance-histogram__chart">
            <div className="indicator-distance-histogram__plot">
              {_.map(ticks, (tick) => (
                <div
                  key={tick}
                  className="indicator-distance-histogram__gridline"
                  style={{ bottom: `${(tick / axis_max) * 100}%` }}
                >
                  <span className="indicator-distance-histogram__tick">
                    {format_tick(tick)}
                  </span>
                </div>
              ))}
              <div className="indicator-distance-histogram__bars">
                {_.map(bins, (bin) => {
                  const count = counts[bin.id];
                  const label = text_maker(bin.label_key);
                  return (
                    <div
                      key={bin.id}
                      className="indicator-distance-histogram__slot"
                      style={{ width: BIN_COLUMN }}
                    >
                      {count > 0 && (
                        <div
                          className={classNames(
                            "indicator-distance-histogram__bar",
                            tone_class[bin.tone]
                          )}
                          style={{ height: `${(count / axis_max) * 100}%` }}
                          title={text_maker("distance_cell_title", {
                            label,
                            count,
                          })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="indicator-distance-histogram__axis">
              {_.map(bins, (bin) => (
                <div
                  key={bin.id}
                  className="indicator-distance-histogram__axis-slot"
                  style={{ width: BIN_COLUMN }}
                >
                  {bin.show_axis_label && (
                    <span className="indicator-distance-histogram__axis-label">
                      {text_maker(bin.label_key)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <table className="indicator-distance-histogram__sr-only">
          <caption>
            {text_maker("distance_histogram_table_caption", { year })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{text_maker("distance_chart_title", { year })}</th>
              <th scope="col">{text_maker("distance_histogram_y_axis")}</th>
            </tr>
          </thead>
          <tbody>
            {_.map(bins, (bin) => (
              <tr key={bin.id}>
                <th scope="row">{text_maker(bin.label_key)}</th>
                <td>{counts[bin.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};

export const GovIndicatorDistanceChart = ({ drr_key }) => {
  const year = get_year_for_doc_key(drr_key);
  const { loading, data } = useGovDrrIndicators({ doc: drr_key });
  const summary = count_indicators_by_distance(_.compact(data));

  return (
    <div className="indicator-distance-chart">
      <div className="medium-panel-text indicator-distance-chart__title">
        <TM k="distance_chart_title" args={{ year }} />
      </div>
      <div className="medium-panel-text indicator-distance-chart__note">
        <TM k="distance_chart_note" />
      </div>
      {loading ? (
        <LeafSpinner config_name="subroute" />
      ) : (
        <Fragment>
          <div className="medium-panel-text indicator-distance-chart__counts">
            <TM
              k="distance_chart_counts"
              args={{
                included: summary.included_count,
                total: summary.total_count,
              }}
            />
          </div>
          {summary.included_count > 0 && (
            <Histogram year={year} counts={summary.counts} />
          )}
        </Fragment>
      )}
    </div>
  );
};
