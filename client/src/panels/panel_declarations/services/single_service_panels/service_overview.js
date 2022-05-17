import _ from "lodash";
import React from "react";

import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";
import text from "src/panels/panel_declarations/services/services.yaml";
import {
  available_icons,
  available_keys,
  application_channels_keys,
} from "src/panels/panel_declarations/services/shared";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  FancyUL,
  AlertBanner,
} from "src/components/index";

import { Dept, Program } from "src/models/subjects";

import { formats } from "src/core/format";

import { infographic_href_template } from "src/link_utils";

import "src/panels/panel_declarations/services/services.scss";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceOverview extends React.Component {
  render() {
    const { service, title, sources, datasets } = this.props;

    const most_recent_year = service.report_years[0];
    const most_recent_report = _.find(service.service_report, {
      year: most_recent_year,
    });
    const applications = _.reduce(
      application_channels_keys,
      (total, key) => total + (most_recent_report[key] || 0),
      0
    );
    const get_uniq_flat_standard_urls = (url_field) =>
      _.chain(service.standards).flatMap(url_field).filter().uniq().value();
    const all_urls = {
      service_url: service.urls,
      standard_url: get_uniq_flat_standard_urls("standard_urls"),
      rtp_url: get_uniq_flat_standard_urls("rtp_urls"),
    };
    return (
      <TextPanel title={title} sources={sources} datasets={datasets}>
        {!service.is_active && (
          <AlertBanner banner_class={"danger"} style={{ textAlign: "center" }}>
            <TM k="inactive_service_warning" />
          </AlertBanner>
        )}
        <dl className="dl-horizontal tombstone-data-list">
          <dt>
            <TM k={"name"} />
          </dt>
          <dd>
            <p>{service.name}</p>
          </dd>
          <dt>
            <TM k={"description"} />
          </dt>
          <dd>
            <p>{service.description}</p>
          </dd>
          <dt>{text_maker("org")}</dt>
          <dd>
            {(() => {
              const org = Dept.store.lookup(service.org_id);
              return (
                <a href={infographic_href_template(org, "services")}>
                  {org.name}
                </a>
              );
            })()}
          </dd>
          <dt>{text_maker("programs")}</dt>
          <dd>
            <ul>
              {_.map(service.program_activity_codes, (program_id) => {
                const program = Program.store.lookup(program_id);
                return (
                  program && (
                    <li key={program_id}>
                      <a href={infographic_href_template(program, "services")}>
                        {program.name}
                      </a>
                    </li>
                  )
                );
              })}
            </ul>
          </dd>
          <dt>{text_maker("service_types")}</dt>
          <dd>
            <ul>
              {_.map(service.service_type, (type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
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
          <dt>
            {text_maker("application_digital")} ({most_recent_year})
          </dt>
          <dd>
            {applications
              ? formats["big_int"](applications, {
                  raw: true,
                })
              : text_maker("no_applications")}
          </dd>
          <dt>
            {text_maker("online_inquiry_count")} ({most_recent_year})
          </dt>
          <dd>
            {formats["big_int"](most_recent_report.online_inquiry_count, {
              raw: true,
            })}
          </dd>
          <dt>{text_maker("last_gender_analysis")}</dt>
          <dd>{service.last_gender_analysis}</dd>
          <dt>{text_maker("last_improve_from_feedback")}</dt>
          <dd>{service.last_improve_from_feedback}</dd>

          <dt>{text_maker("last_accessibility_review")}</dt>
          <dd>{service.last_accessibility_review}</dd>

          <dt>{text_maker("service_link_text")}</dt>
          <dd>
            {_.map(all_urls, (urls, url_type) =>
              _.map(urls, (url, i) => (
                <p key={_.uniqueId()}>
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

export const declare_single_service_overview_panel = () =>
  declare_panel({
    panel_key: "single_service_overview",
    subject_types: ["service"],
    panel_config_func: () => ({
      get_title: () => text_maker("service_overview_title"),
      get_dataset_keys: () => ["service_inventory"],
      render({ title, subject, sources, datasets }) {
        return (
          <ServiceOverview
            service={subject}
            title={title}
            sources={sources}
            datasets={datasets}
          />
        );
      },
    }),
  });
