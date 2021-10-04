import _ from "lodash";
import React from "react";

import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";
import text from "src/panels/panel_declarations/services/services.yaml";
import {
  available_icons,
  available_keys,
  application_channels_keys,
} from "src/panels/panel_declarations/services/shared";

import { create_text_maker_component, FancyUL } from "src/components/index";

import { Program } from "src/models/subjects";

import { formats } from "src/core/format";

import { infograph_href_template } from "src/link_utils";

import "src/panels/panel_declarations/services/services.scss";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceOverview extends React.Component {
  render() {
    const { service } = this.props;
    const most_recent_report = _.chain(service.service_report)
      .sortBy((report) => _.toInteger(report.year))
      .reverse()
      .value()[0];
    const applications = _.reduce(
      application_channels_keys,
      (total, key) => {
        const sum_for_key =
          _.sumBy(service.service_report, `${key}_count`) || 0;
        return total + sum_for_key;
      },
      0
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
          <dt>
            <TM k={"identification_methods"} />
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
          <dt>{text_maker("link_to_programs")}</dt>
          <dd>
            {_.map(service.program_activity_codes, (program_id) => {
              const program = Program.store.lookup(program_id);
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
          <dt>{text_maker("application_digital")}</dt>
          <dd>
            {formats["big_int"](applications, {
              raw: true,
            })}
          </dd>
          <dt>{text_maker("online_inquiry_count")}</dt>
          <dd>
            {formats["big_int"](
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
