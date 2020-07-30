import "../services.scss";
import text from "../services.yaml";
import { create_text_maker_component, FancyUL } from "../../../../components";
import { Subject } from "../../../../models/subject.js";
import {
  available_icons,
  available_keys,
  service_channels_keys,
} from "../shared";
import { infograph_href_template } from "../../../../link_utils.js";
import ProgressGauge from "../../../../charts/progressGauge.js";
import { Fragment } from "react";
import { TextPanel, formatter } from "../../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceOverviewV2 extends React.Component {
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
    const total_business_vol = _.reduce(
      service_channels_keys,
      (total, key) => {
        const sum_for_key =
          _.sumBy(service.service_report, `${key}_count`) || 0;
        return total + sum_for_key;
      },
      0
    );
    const formatted_business_vol = formatter("big_int", total_business_vol, {
      raw: true,
    });

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
                    backgroundColor:
                      window.infobase_color_constants.backgroundColor,
                  }}
                  className="service-overview-rect"
                >
                  <ProgressGauge
                    value={
                      _.countBy(flat_standard_reports, "is_target_met").true ||
                      0
                    }
                    total_value={flat_standard_reports.length}
                  />
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
            <FancyUL className="service_overview-fancy-ul">
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
          <dt>{text_maker("total_business_vol")}</dt>
          <dd>{formatted_business_vol}</dd>
          <dt>{text_maker("service_link_text")}</dt>
          <dd>
            {!_.isEmpty(service.urls) &&
              _.map(service.urls, (url, i) => (
                <p key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {`${text_maker("link")} ${i + 1}`}
                  </a>
                </p>
              ))}
          </dd>
        </dl>
      </TextPanel>
    );
  }
}
