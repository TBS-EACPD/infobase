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
  TabsStateful,
} from "src/components/index";

//import { create_fake_footnote } from "src/models/footnotes/footnotes";

import { create_footnote } from "src/models/footnotes/footnotes";

import { newIBCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { toggle_list } from "src/general_utils";

import { IconAttention, IconCheck, IconNotApplicable } from "src/icons/icons";

const { text_maker, TM } = create_text_maker_component(text);

const standard_statuses = ["met", "not_met", "no_data"];
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
    const { standards, year } = this.props;

    const { active_statuses } = this.state;

    const uniq_standards = _.uniqBy(standards, "standard_id");

    const get_is_target_met = (is_target_met, count, met_count) => {
      if (met_count / count) {
        if (is_target_met) {
          return "met";
        } else {
          return "not_met";
        }
      } else {
        return "no_data";
      }
    };
    const get_target = (target) => {
      if (_.isNull(target)) {
        return "N/A";
      }

      if (target === 0) {
        return target;
      } else {
        return `${target}%`;
      }
    };
    const get_counts = (value) => (_.isNull(value) ? "N/A" : value);

    const data = _.flatMap(
      uniq_standards,
      ({ name, type, channel, standard_report }) =>
        _.chain(standard_report)
          .filter({ year })
          .map(({ lower, count, met_count, is_target_met }) => ({
            name,
            standard_type: type,
            target: get_target(lower),
            channel,
            count: get_counts(count),
            met_count: get_counts(met_count),
            performance: met_count / count || 0,
            is_target_met: get_is_target_met(is_target_met, count, met_count),
          }))
          .value()
    );

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

    return (
      <Fragment>
        {!_.isEmpty(data) ? (
          <Fragment>
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
      </Fragment>
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
      footnotes: false,
      render({ title, subject, sources, datasets }) {
        const standards = subject.standards;
        const years = _.chain(standards)
          .map("submission_year")
          .uniq()
          .sort()
          .value();

        let footnotes = _.concat(
          create_footnote({
            id: "",
            subject_type: subject.subject_type,
            subject_id: subject.id,
            topic_keys: ["SERVICE_STANDARDS"],
            text: text_maker("new_standards_data"),
          }),
          _.chain(standards)
            .map(
              (standard) =>
                standard.other_type_comment &&
                create_footnote({
                  id: "",
                  subject_type: subject.subject_type,
                  subject_id: subject.id,
                  topic_keys: ["OTHER_TYPE_COMMENT"],
                  text: standard.other_type_comment,
                })
            )
            .filter()
            .value()
        );

        if (subject.id === "1491") {
          footnotes = _.concat(
            footnotes,
            create_footnote({
              id: "",
              subject_type: subject.subject_type,
              subject_id: subject.id,
              topic_keys: ["SERVICE_STANDARDS"],
              text: text_maker("IRCC_hotfix"),
            })
          );
        }

        return (
          <InfographicPanel
            title={title}
            sources={sources}
            datasets={datasets}
            footnotes={footnotes}
          >
            {!_.isEmpty(standards) ? (
              <>
                <TM className="medium-panel-text" k="service_standards_text" />
                <TabsStateful
                  default_tab_key={_.last(years)}
                  tabs={_.chain(years)
                    .map((year) => [
                      year,
                      {
                        label: formats.year_to_fiscal_year_raw(year),
                        content: (
                          <ServiceStandards
                            standards={_.filter(standards, {
                              submission_year: year,
                            })}
                            year={year}
                            key={year}
                            title={title}
                            footnotes={footnotes}
                          />
                        ),
                      },
                    ])
                    .fromPairs()
                    .value()}
                />
              </>
            ) : (
              <TM className="medium-panel-text" k="no_service_standards_text" />
            )}
          </InfographicPanel>
        );
      },
    }),
  });
