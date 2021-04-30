import _ from "lodash";
import React, { Fragment } from "react";

import { TextPanel } from "src/panels/panel_declarations/InfographicPanel.js";
import text from "src/panels/panel_declarations/services/services.yaml";
import {
  available_icons,
  available_keys,
  delivery_channels_keys,
} from "src/panels/panel_declarations/services/shared.js";

import {
  DisplayTable,
  create_text_maker_component,
  FancyUL,
} from "src/components/index.js";

import { Subject } from "src/models/subject.js";

import { backgroundColor } from "src/core/color_defs.js";
import { formatter } from "src/core/format.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import Gauge from "src/charts/gauge.js";

import { infograph_href_template } from "src/link_utils.js";
import "src/panels/panel_declarations/services/services.scss";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceOverview extends React.Component {
  render() {
    const { service } = this.props;
    const most_recent_report = _.chain(service.service_report)
      .sortBy((report) => _.toInteger(report.year))
      .reverse()
      .value()[0];
    const flat_standard_reports = _.chain(service.standards)
      .map(({ standard_report }) => standard_report)
      .flatten()
      .value();
    const applications_and_calls = _.reduce(
      delivery_channels_keys,
      (total, key) => {
        const sum_for_key =
          _.sumBy(service.service_report, `${key}_count`) || 0;
        return total + sum_for_key;
      },
      0
    );
    const standards_met_data = _.countBy(
      flat_standard_reports,
      "is_target_met"
    );
    const get_uniq_flat_standard_urls = (url_field) =>
      _.chain(service.standards).flatMap(url_field).filter().uniq().value();
    const all_urls = {
      service_url: service.urls,
      standard_url: get_uniq_flat_standard_urls("urls"),
      rtp_url: get_uniq_flat_standard_urls("rtp_urls"),
    };
    return (
      <TextPanel title={text_maker("service_overview_title")}>
        <dl className="dl-horizontal tombstone-data-list">
          <dt>
            <TM k={"description"} />
          </dt>
          <dd>
            <p>{service.description}</p>
          </dd>
          <dt>{text_maker("service_types")}</dt>
          <dd>
            {_.map(service.service_type, (type) => (
              <p key={type}>{type}</p>
            ))}
          </dd>
          {!_.isEmpty(flat_standard_reports) && (
            <Fragment>
              <dt>
                <TM k={"standards_performance_text"} />
              </dt>
              <dd>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingBottom: "10px",
                    backgroundColor: backgroundColor,
                  }}
                  className="service-overview-rect"
                >
                  {is_a11y_mode ? (
                    <DisplayTable
                      util_components={{
                        copyCsvUtil: null,
                        downloadCsvUtil: null,
                        columnToggleUtil: null,
                      }}
                      column_configs={{
                        id: {
                          index: 0,
                          header: text_maker("target_met_table_text"),
                        },
                        value: {
                          index: 1,
                          header: text_maker("value"),
                        },
                        pct: {
                          index: 2,
                          header: text_maker("percentage"),
                          formatter: "percentage1",
                        },
                      }}
                      data={[
                        {
                          id: text_maker("target_met_false"),
                          value: standards_met_data.false || 0,
                          pct:
                            standards_met_data.false /
                              flat_standard_reports.length || 0,
                        },
                        {
                          id: text_maker("target_met_true"),
                          value: standards_met_data.true || 0,
                          pct:
                            standards_met_data.true /
                              flat_standard_reports.length || 0,
                        },
                      ]}
                    />
                  ) : (
                    <Gauge
                      value={standards_met_data.true || 0}
                      total_value={flat_standard_reports.length}
                    />
                  )}
                </div>
              </dd>
            </Fragment>
          )}
          <dt>
            {`${text_maker("identification_methods")} (${
              most_recent_report.year
            })`}
          </dt>
          <dd>
            <FancyUL>
              {_.map(
                {
                  uses_sin_as_identifier: "sin_collected",
                  uses_cra_as_identifier: "cra_business_ids_collected",
                },
                (id, id_key) => (
                  <div key={id_key} className="identifier-item">
                    <TM style={{ lineHeight: 2 }} k={id_key} />
                    <div>
                      {available_icons[available_keys[most_recent_report[id]]]}
                      <TM
                        style={{ marginLeft: 5 }}
                        k={available_keys[most_recent_report[id]]}
                      />
                    </div>
                  </div>
                )
              )}
            </FancyUL>
          </dd>
          <dt>{text_maker("related_programs")}</dt>
          <dd>
            {_.map(service.program_ids, (program_id) => {
              const program = Subject.Program.lookup(program_id);
              return (
                program && (
                  <p key={program_id}>
                    <a href={infograph_href_template(program)}>
                      {program.name}
                    </a>
                  </p>
                )
              );
            })}
          </dd>
          <dt>{text_maker("services_fees")}</dt>
          <dd>
            <TM
              k={
                service.collects_fees
                  ? "does_charge_fees"
                  : "does_not_charge_fees"
              }
            />
          </dd>
          <dt>{text_maker("applications_and_calls")}</dt>
          <dd>
            {formatter("big_int", applications_and_calls, {
              raw: true,
            })}
          </dd>
          <dt>{text_maker("online_inquiry")}</dt>
          <dd>
            {formatter(
              "big_int",
              _.sumBy(service.service_report, "online_inquiry_count"),
              {
                raw: true,
              }
            )}
          </dd>
          <dt>{text_maker("service_link_text")}</dt>
          <dd>
            {_.map(all_urls, (urls, url_type) =>
              _.map(urls, (url, i) => (
                <p key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {`${text_maker(url_type)} ${i + 1}`}
                  </a>
                </p>
              ))
            )}
          </dd>
        </dl>
      </TextPanel>
    );
  }
}
