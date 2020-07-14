import "../services.scss";
import text from "../services.yaml";
import { create_text_maker_component, FancyUL } from "../../../../components";
import { Subject } from "../../../../models/subject.js";
import { available_icons, available_keys } from "../shared";
import { infograph_href_template } from "../../../../link_utils.js";
import Gauge from "../../../../charts/gauge.js";
import { Fragment } from "react";
import { TextPanel } from "../../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const OverviewUL = ({ title, children }) => (
  <ul className={"overview-ul"} aria-label={title}>
    {title && (
      <li className={"overview-ul__title"} aria-hidden={true}>
        {title}
      </li>
    )}
    {_.chain(children)
      .compact()
      .map((item, i) => <li key={i}>{item}</li>)
      .value()}
  </ul>
);

export class ServiceOverview extends React.Component {
  render() {
    const { service } = this.props;
    const most_recent_report = _.chain(service.service_report)
      .sortBy((report) => _.toInteger(report.year))
      .reverse()
      .value()[0];

    return (
      <TextPanel title={text_maker("service_overview_title")}>
        <dl className="dl-horizontal tombstone-data-list">
          <dt>Description/Raison d'être</dt>
          <dd>
            <p>{service.description}</p>
          </dd>
          <dt>{text_maker("service_types")}</dt>
          <dd>
            {_.map(service.service_type, (type) => (
              <p>{type}</p>
            ))}
          </dd>
          {!_.isEmpty(standards) && (
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
                  }}
                  className="service-overview-rect"
                >
                  <Gauge
                    //TODO need is_target_met column from Titan
                    value={0 /*_.countBy(standards, "is_target_met").true*/}
                    total_value={standards.length}
                  />
                </div>
              </dd>
            </Fragment>
          )}
          <dt>
            {text_maker("identification_methods")} ({most_recent_report.year})
          </dt>
          <dd>
            <FancyUL className="service_overview-fancy-ul">
              {[
                <div key="uses_cra_as_identifier" className="identifier-item">
                  <TM style={{ lineHeight: 2 }} k="uses_cra_as_identifier" />
                  <div>
                    {
                      available_icons[
                        available_keys[
                          most_recent_report.cra_business_ids_collected
                        ]
                      ]
                    }
                    <TM
                      style={{ marginLeft: 5 }}
                      k={
                        available_keys[
                          most_recent_report.cra_business_ids_collected
                        ]
                      }
                    />
                  </div>
                </div>,
                <div key="uses_sin_as_identifier" className="identifier-item">
                  <TM style={{ lineHeight: 2 }} k="uses_sin_as_identifier" />
                  <div>
                    {
                      available_icons[
                        available_keys[most_recent_report.SIN_collected]
                      ]
                    }
                    <TM
                      style={{ marginLeft: 5 }}
                      k={available_keys[most_recent_report.SIN_collected]}
                    />
                  </div>
                </div>,
              ]}
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
          <dt>{text_maker("service_link_text")}</dt>
          <dd>
            {!_.isEmpty(service.urls) &&
              (service.urls.length === 1 ? (
                <a>{service.urls[0]}</a>
              ) : (
                <div>
                  {_.map(service.urls, (url, i) => (
                    <p key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {`${text_maker("link")} ${i + 1}`}
                      </a>
                    </p>
                  ))}
                </div>
              ))}
          </dd>
        </dl>
      </TextPanel>
    );
  }
}
