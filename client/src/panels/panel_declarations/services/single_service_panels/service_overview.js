import "../services.scss";
import text from "../services.yaml";
import {
  create_text_maker_component,
  Panel,
  FancyUL,
} from "../../../../components";
import { Subject } from "../../../../models/subject.js";
import { available_icons, available_keys } from "../shared";
import { infograph_href_template } from "../../../../link_utils.js";
import Gauge from "../../../../charts/gauge.js";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceOverview extends React.Component {
  render() {
    const { service } = this.props;
    const standards = service.standards;
    const most_recent_report = _.chain(service.service_report)
      .sortBy((report) => _.toInteger(report.year))
      .reverse()
      .value()[0];

    return (
      <Panel title={text_maker("service_overview_title")}>
        <div className={"col-container"}>
          <div className="fcol-md-7">
            <div className="service-overview-rect">
              <h3>{service.description}</h3>
            </div>
            <div className="service-overview-rect">
              <FancyUL title={text_maker("service_types")}>
                {_.map(service.service_type)}
              </FancyUL>
            </div>
            {!_.isEmpty(standards) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingBottom: "10px",
                }}
                className="service-overview-rect"
              >
                <TM el="h2" k={"standards_performance_text"} />
                <Gauge
                  //TODO need is_target_met column from Titan
                  value={0 /*_.countBy(standards, "is_target_met").true*/}
                  total_value={standards.length}
                />
              </div>
            )}
          </div>
          <div className="fcol-md-5">
            <div className="service-overview-rect">
              <FancyUL
                className="service_overview-fancy-ul"
                title={`${text_maker("identification_methods")} (${
                  most_recent_report.year
                })`}
              >
                {[
                  <div key="uses_cra_as_identifier" className="identifier-item">
                    <TM style={{ lineHeight: 2 }} k="uses_cra_as_identifier" />
                    {
                      available_icons[
                        available_keys[
                          most_recent_report.cra_business_ids_collected
                        ]
                      ]
                    }
                  </div>,
                  <div key="uses_sin_as_identifier" className="identifier-item">
                    <TM style={{ lineHeight: 2 }} k="uses_sin_as_identifier" />
                    {
                      available_icons[
                        available_keys[most_recent_report.SIN_collected]
                      ]
                    }
                  </div>,
                ]}
              </FancyUL>
            </div>
            {!_.isEmpty(service.program_ids) && (
              <div className="service-overview-rect">
                <FancyUL title={text_maker("related_programs")}>
                  {_.map(service.program_ids, (program_id) => {
                    const program = Subject.Program.lookup(program_id);
                    return (
                      program && (
                        <a
                          key={program_id}
                          href={infograph_href_template(program)}
                        >
                          {program.name}
                        </a>
                      )
                    );
                  })}
                </FancyUL>
              </div>
            )}
            <div className="service-overview-rect">
              <TM
                el="h4"
                k={
                  service.collects_fees
                    ? "does_charge_fees"
                    : "does_not_charge_fees"
                }
              />
            </div>
            {!_.isEmpty(service.urls) && (
              <div className="service-overview-rect">
                {service.urls.length === 1 ? (
                  <TM
                    el="h2"
                    k={"service_single_link_text"}
                    args={{ service_url: service.urls[0] }}
                  />
                ) : (
                  <div>
                    <TM el="h2" k={"service_links_text"} />
                    <FancyUL>
                      {_.map(service.urls, (url, i) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {`${text_maker("link")} ${i + 1}`}
                        </a>
                      ))}
                    </FancyUL>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Panel>
    );
  }
}
