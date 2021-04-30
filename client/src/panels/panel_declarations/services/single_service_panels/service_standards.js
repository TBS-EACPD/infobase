import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import text from "src/panels/panel_declarations/services/services.yaml";

import {
  DisplayTable,
  create_text_maker_component,
  Panel,
  FilterTable,
} from "src/components/index.js";

import FootNote from "src/models/footnotes/footnotes.js";

import { newIBCategoryColors } from "src/core/color_schemes.ts";
import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import {
  IconAttention,
  IconCheck,
  IconNotApplicable,
} from "src/icons/icons.tsx";

const { text_maker, TM } = create_text_maker_component(text);

const standard_statuses = ["met", "not_met", "no_data"];
const color_scale = scaleOrdinal()
  .domain(standard_statuses)
  .range(_.take(newIBCategoryColors, 2));

export class ServiceStandards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_statuses: standard_statuses,
    };
  }

  render() {
    const { service } = this.props;
    const { active_statuses } = this.state;
    const standards = service.standards;

    const footnotes = _.chain(standards)
      .map(
        (standard) =>
          standard.other_type_comment &&
          FootNote.create_and_register({
            id: `other_type_comment_${standard.standard_id}`,
            topic_keys: ["OTHER_TYPE_COMMENT"],
            subject: service,
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
      if (is_target_met) {
        if (
          target_type !== "Other type of target" &&
          !lower &&
          !count &&
          !met_count
        ) {
          return "no_data";
        } else {
          return "met";
        }
      } else {
        return "not_met";
      }
    };
    const get_target = (target_type, target) => {
      if (target_type === "Other type of target") {
        if (_.isNull(target)) {
          return "N/A";
        } else {
          return target;
        }
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
      title: text_maker(status),
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
        header: text_maker("status"),
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
        header: text_maker("satisfied_business_volume"),
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

    return (
      <Panel
        title={text_maker("service_standards_title")}
        footnotes={footnotes}
      >
        {!_.isEmpty(data) ? (
          <Fragment>
            <TM className="medium-panel-text" k="service_standards_text" />
            {!is_a11y_mode && (
              <FilterTable
                items={_.map(standard_statuses, (status_key) => ({
                  key: status_key,
                  count: _.countBy(data, "is_target_met")[status_key] || 0,
                  active:
                    active_statuses.length === standard_statuses.length ||
                    _.indexOf(active_statuses, status_key) !== -1,
                  text: !is_a11y_mode ? (
                    <span
                      className="link-unstyled"
                      tabIndex={0}
                      aria-hidden="true"
                    >
                      {text_maker(status_key)}
                    </span>
                  ) : (
                    text_maker(status_key)
                  ),
                  icon: status_icons[status_key],
                }))}
                item_component_order={["count", "icon", "text"]}
                click_callback={(status_key) =>
                  this.setState({
                    active_statuses: _.toggle_list(active_statuses, status_key),
                  })
                }
                show_eyes_override={
                  active_statuses.length === standard_statuses.length
                }
              />
            )}
            <DisplayTable
              data={filtered_data}
              column_configs={column_configs}
            />
          </Fragment>
        ) : (
          <TM className="medium-panel-text" k="no_service_standards_text" />
        )}
      </Panel>
    );
  }
}
