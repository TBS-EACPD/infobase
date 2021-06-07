import _ from "lodash";
import React from "react";

import { textColor } from "src/core/color_defs";
import { infobase_colors } from "src/core/color_schemes";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import { toggle_list } from "src/general_utils";

import {
  get_est_doc_name,
  get_est_doc_order,
  get_est_doc_glossary_key,
} from "./covid_common_utils";
import { get_tooltip } from "./covid_estimates_tooltips";
import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_estimates.yaml";

const { text_maker, TM } = covid_create_text_maker_component(text);

const colors = infobase_colors();

export default class SummaryTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: [
        text_maker(`covid_estimates_stat`),
        text_maker(`covid_estimates_vote`),
      ],
    };

    const data = this.props.data;

    this.graph_index_key = "index_key";

    this.sorted_data = _.sortBy(data, ({ est_doc }) =>
      get_est_doc_order(est_doc)
    );

    this.graph_data = _.chain(this.sorted_data)
      .map(({ est_doc, stat, vote }) => ({
        [this.graph_index_key]: get_est_doc_name(est_doc),
        [text_maker(`covid_estimates_stat`)]: stat,
        [text_maker(`covid_estimates_vote`)]: vote,
      }))
      .value();

    this.graph_keys = _.chain(this.graph_data)
      .first()
      .omit(this.graph_index_key)
      .keys()
      .value();
  }

  filter_graph() {
    return _.map(this.graph_data, (data) =>
      _.pick(data, [this.graph_index_key, ...this.state.selected])
    );
  }

  graph_content() {
    return (
      <WrappedNivoBar
        data={this.filter_graph()}
        keys={this.graph_keys}
        indexBy={this.graph_index_key}
        colors={(d) => colors(d.id)}
        margin={{
          top: 50,
          right: 40,
          bottom: 120,
          left: 40,
        }}
        bttm_axis={{
          format: (d) =>
            _.words(d).length > 3 ? d.substring(0, 20) + "..." : d,
          tickSize: 3,
          tickRotation: -45,
          tickPadding: 10,
        }}
        graph_height="450px"
        enableGridX={false}
        remove_left_axis={true}
        theme={{
          axis: {
            ticks: {
              text: {
                fontSize: 12,
                fill: textColor,
                fontWeight: "550",
              },
            },
          },
        }}
      />
    );
  }

  render() {
    const { subject, selected_year } = this.props.panel_args;
    const additional_text_args = (() => {
      if (subject.level === "gov") {
        return {
          covid_est_pct_of_all_est:
            this.props.panel_args[`gov_covid_estimates_in_year`] /
            this.props.panel_args[`gov_total_estimates_in_year`],
        };
      } else {
        const dept_covid_estimates_in_year = _.reduce(
          this.sorted_data,
          (memo, { stat, vote }) => memo + vote + stat,
          0
        );

        return {
          dept_covid_estimates_in_year,
        };
      }
    })();

    return (
      <div className="row align-items-center">
        <div className="col-12 col-lg-6 medium-panel-text">
          <TM
            k={`covid_estimates_summary_text_${subject.level}`}
            args={{ ...this.props.panel_args, ...additional_text_args }}
          />
          <TM k={"covid_estimates_by_release_title"} />
          <ul>
            {_.map(this.sorted_data, ({ est_doc, vote, stat }) => (
              <li key={est_doc}>
                <TM
                  k={"covid_estimates_by_release"}
                  args={{
                    est_doc_name: get_est_doc_name(est_doc),
                    est_doc_glossary_key: get_est_doc_glossary_key(est_doc),
                    total: vote + stat,
                  }}
                  el="span"
                  style={{ display: "inline-block" }}
                />
                {get_tooltip(
                  "est_doc_total",
                  selected_year,
                  subject.id,
                  est_doc
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-12 col-lg-6">
          {!is_a11y_mode && (
            <StandardLegend
              items={_.map(this.graph_keys, (key) => ({
                id: key,
                label: key,
                active: _.includes(this.state.selected, key),
                color: colors(key),
              }))}
              isHorizontal={true}
              onClick={(label) => {
                !(
                  this.state.selected.length === 1 &&
                  this.state.selected.includes(label)
                ) &&
                  this.setState({
                    selected: toggle_list(this.state.selected, label),
                  });
              }}
            />
          )}
          {this.graph_content()}
        </div>
      </div>
    );
  }
}
