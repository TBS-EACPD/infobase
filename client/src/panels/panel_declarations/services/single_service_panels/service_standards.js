import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import text from "src/panels/panel_declarations/services/services.yaml";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  DisplayTable,
  create_text_maker_component,
  VisibilityControl,
  HeightClipper,
} from "src/components/index";

import { create_fake_footnote } from "src/models/footnotes/footnotes";

import { newIBCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoHBar } from "src/charts/wrapped_nivo/WrappedNivoBar/wrapped_nivo_bar";

import { toggle_list } from "src/general_utils";

import { IconAttention, IconCheck, IconNotApplicable } from "src/icons/icons";

const { text_maker, TM } = create_text_maker_component(text);

const standard_statuses = ["met", "not_met", "no_data"];
const met_text = text_maker("target_met_true");
const not_met_text = text_maker("target_met_false");
const no_data_text = text_maker("no_data");
const standard_statuses_text = [met_text, not_met_text, no_data_text];
const color_scale = scaleOrdinal()
  .domain(standard_statuses)
  .range(_.take(newIBCategoryColors, 3));

export class ServiceStandards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_statuses: standard_statuses,
    };
  }

  render() {
    const { service, title, sources, datasets } = this.props;

    const { active_statuses } = this.state;

    const standards = _.uniqBy(service.standards, "standard_id");

    const footnotes = _.chain(standards)
      .map(
        (standard) =>
          standard.other_type_comment &&
          create_fake_footnote({
            topic_keys: ["OTHER_TYPE_COMMENT"],
            text: standard.other_type_comment,
          })
      )
      .filter()
      .value();

    const get_is_target_met = (
      is_target_met,
      target_type,
      lower,
      count,
      met_count
    ) => {
      if (
        target_type !== "Other type of target" &&
        !lower &&
        !count &&
        !met_count
      ) {
        return "no_data";
      }
      return is_target_met ? "met" : "not_met";
    };
    const get_target = (target_type, target) => {
      if (_.isNull(target)) {
        return "N/A";
      }
      if (target_type === "Other type of target") {
        return target;
      } else {
        if (target === 0) {
          return target;
        } else {
          return `${target}%`;
        }
      }
    };
    const get_counts = (value) => (_.isNull(value) ? "N/A" : value);

    const data = _.chain(standards)
      .map(({ name, type, channel, standard_report, target_type }) =>
        _.map(
          standard_report,
          ({ year, lower, count, met_count, is_target_met }) => ({
            name,
            year,
            standard_type: type,
            target: get_target(target_type, lower),
            channel,
            count: get_counts(count),
            met_count: get_counts(met_count),
            performance:
              target_type === "Other type of target"
                ? met_count / count
                  ? met_count / count
                  : "N/A"
                : met_count / count || 0,
            is_target_met: get_is_target_met(
              is_target_met,
              target_type,
              lower,
              count,
              met_count
            ),
          })
        )
      )
      .flatten()
      .value();

    const get_icon_props = (status) => ({
      key: status,
      aria_label: text_maker(status),
      color: color_scale(status),
      width: 38,
      vertical_align: "0em",
      alternate_color: false,
      inline: false,
    });
    const status_icons = {
      met: <IconCheck {...get_icon_props("met")} />,
      not_met: <IconAttention {...get_icon_props("not_met")} />,
      no_data: <IconNotApplicable {...get_icon_props("no_data")} />,
    };

    const column_configs = {
      name: {
        index: 0,
        header: text_maker("standard_name"),
        is_searchable: true,
      },
      year: {
        index: 1,
        header: text_maker("year"),
      },
      target: {
        index: 2,
        header: text_maker("target"),
      },
      performance: {
        index: 3,
        header: text_maker("performance"),
        formatter: "percentage",
      },
      is_target_met: {
        index: 4,
        header: text_maker("result"),
        formatter: (value) =>
          is_a11y_mode ? text_maker(value) : status_icons[value],
      },
      count: {
        index: 5,
        header: text_maker("total_business_volume"),
        formatter: "big_int",
      },
      met_count: {
        index: 6,
        header: text_maker("volume_target"),
        formatter: "big_int",
      },
      standard_type: {
        index: 7,
        header: text_maker("standard_type"),
      },
      channel: {
        index: 8,
        header: text_maker("standard_channel"),
      },
    };

    const filtered_data = _.filter(
      data,
      ({ is_target_met }) =>
        !_.isEmpty(active_statuses) &&
        (active_statuses.length === standard_statuses.length ||
          _.includes(active_statuses, is_target_met))
    );
    const graph_data = _.chain(data)
      .groupBy("year")
      .map((standards, year) => {
        const { met, not_met, no_data } = _.countBy(standards, "is_target_met");
        return {
          year: formats.year_to_fiscal_year_raw(year),
          [met_text]: met || 0,
          [not_met_text]: not_met || 0,
          [no_data_text]: no_data || 0,
        };
      })
      .reverse()
      .value();

    return (
      <InfographicPanel
        title={title}
        sources={sources}
        datasets={datasets}
        footnotes={footnotes}
      >
        {!_.isEmpty(data) ? (
          <Fragment>
            <TM className="medium-panel-text" k="service_standards_text" />
            <StandardLegend
              legendListProps={{
                isHorizontal: true,
                items: _.map(standard_statuses_text, (status) => ({
                  id: status,
                  label: status,
                  color: color_scale(status),
                })),
                checkBoxProps: { isSolidBox: true },
              }}
            />
            <WrappedNivoHBar
              data={graph_data}
              is_money={false}
              enableGridX={false}
              indexBy={"year"}
              keys={standard_statuses_text}
              colors={(d) => color_scale(d.id)}
              bttm_axis={{
                renderTick: (tick) =>
                  tick.value % 1 === 0 && (
                    <g
                      key={tick.tickIndex}
                      transform={`translate(${tick.x},${tick.y + 3})`}
                    >
                      <line
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="7"
                        transform={`translate(0,-20)`}
                        style={{ stroke: "rgb(119, 119, 119)", strokeWidth: 1 }}
                      />
                      <text
                        style={{ fontSize: "11px", color: "#333" }}
                        transform={`translate(-${
                          4 * _.toString(tick.value).length
                        },0)`}
                      >
                        {tick.value}
                      </text>
                    </g>
                  ),
              }}
            />
            <div className="panel-separator" style={{ marginBottom: "50px" }} />
            {!is_a11y_mode && (
              <VisibilityControl
                items={_.map(standard_statuses, (status_key) => ({
                  key: status_key,
                  count: _.countBy(data, "is_target_met")[status_key] || 0,
                  active:
                    active_statuses.length === standard_statuses.length ||
                    _.indexOf(active_statuses, status_key) !== -1,
                  text: text_maker(status_key),
                  icon: status_icons[status_key],
                }))}
                item_component_order={["count", "icon", "text"]}
                click_callback={(status_key) =>
                  this.setState({
                    active_statuses: toggle_list(active_statuses, status_key),
                  })
                }
                show_eyes_override={
                  active_statuses.length === standard_statuses.length
                }
              />
            )}
            <HeightClipper clipHeight={500}>
              <DisplayTable
                data={filtered_data}
                column_configs={column_configs}
              />
            </HeightClipper>
          </Fragment>
        ) : (
          <TM className="medium-panel-text" k="no_service_standards_text" />
        )}
      </InfographicPanel>
    );
  }
}

export const declare_single_service_standards_panel = () =>
  declare_panel({
    panel_key: "single_service_standards",
    subject_types: ["service"],
    panel_config_func: () => ({
      get_title: () => text_maker("service_standards_title"),
      get_dataset_keys: () => ["service_inventory"],
      render({ title, subject, sources, datasets }) {
        return (
          <ServiceStandards
            service={subject}
            title={title}
            sources={sources}
            datasets={datasets}
          />
        );
      },
    }),
  });
