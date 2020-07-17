import "../services.scss";
import text from "../services.yaml";
import { create_text_maker_component, Panel } from "../../../../components";
import { Subject } from "../../../../models/subject.js";
import { available_icons, available_keys } from "../shared";
import { infograph_href_template } from "../../../../link_utils.js";
import Gauge from "../../../../charts/gauge.js";

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
    const flat_standard_reports = _.chain(service.standards)
      .map(({ standard_report }) => standard_report)
      .flatten()
      .value();

    return (
      <Panel title={text_maker("service_overview_title")}>
        <div className={"col-container"}>
          <div className="fcol-md-7">
            <div className="service-overview-rect medium_panel_text">
              {service.description}
            </div>
            <div className="service-overview-rect">
              <OverviewUL
                className="service_overview-fancy-ul"
                title={`${text_maker("identification_methods")} (${
                  most_recent_report.year
                })`}
              >
                {[
                  <div key="uses_cra_as_identifier" className="identifier-item">
                    <TM
                      className="medium_panel_text"
                      k="uses_cra_as_identifier"
                    />
                    {
                      available_icons[
                        available_keys[
                          most_recent_report.cra_business_ids_collected
                        ]
                      ]
                    }
                  </div>,
                  <div key="uses_sin_as_identifier" className="identifier-item">
                    <TM
                      className="medium_panel_text"
                      k="uses_sin_as_identifier"
                    />
                    {
                      available_icons[
                        available_keys[most_recent_report.SIN_collected]
                      ]
                    }
                  </div>,
                ]}
              </OverviewUL>
            </div>
            {!_.isEmpty(flat_standard_reports) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingBottom: "10px",
                }}
                className="service-overview-rect"
              >
                <TM
                  className="medium_panel_text"
                  k={"standards_performance_text"}
                />
                <Gauge
                  value={_.countBy(flat_standard_reports, "is_target_met").true}
                  total_value={flat_standard_reports.length}
                />
              </div>
            )}
          </div>
          <div className="fcol-md-5">
            <div className="medium_panel_text service-overview-rect">
              <OverviewUL title={text_maker("service_types")}>
                {_.map(service.service_type)}
              </OverviewUL>
            </div>
            {!_.isEmpty(service.program_ids) && (
              <div className="service-overview-rect">
                <OverviewUL title={text_maker("related_programs")}>
                  {_.map(service.program_ids, (program_id) => {
                    const program = Subject.Program.lookup(program_id);
                    return (
                      program && (
                        <a
                          key={program_id}
                          href={infograph_href_template(program)}
                          className="medium_panel_text"
                        >
                          {program.name}
                        </a>
                      )
                    );
                  })}
                </OverviewUL>
              </div>
            )}
            <div className="service-overview-rect">
              <TM
                className="medium_panel_text"
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
                    className="medium_panel_text"
                    k={"service_single_link_text"}
                    args={{ service_url: service.urls[0] }}
                  />
                ) : (
                  <div>
                    <TM
                      className="medium_panel_text"
                      k={"service_links_text"}
                    />
                    <OverviewUL>
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
                    </OverviewUL>
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
