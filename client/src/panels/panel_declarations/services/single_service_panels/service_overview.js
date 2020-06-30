import "./service_overview.scss";
import text from "./service_overview.yaml";
import {
  create_text_maker_component,
  Panel,
  DisplayTable,
  FancyUL,
} from "../../../../components";
import { Subject } from "../../../../models/subject.js";
import { infograph_href_template } from "../../../../link_utils.js";
import { IconX, IconCheck } from "../../../../icons/icons.js";
import Gauge from "../../../../charts/gauge.js";

const { text_maker, TM } = create_text_maker_component(text);
const digital_status_keys = [
  "account_reg_digital",
  "application_digital",
  "authentication",
  "decision_digital",
  "issuance_digital",
  "issue_res_digital",
];

export class ServiceOverview extends React.Component {
  render() {
    const { service } = this.props;
    const standards = service.standards;
    const get_icon = (value) =>
      value ? (
        <IconCheck
          title={text_maker("yes")}
          color={window.infobase_color_constants.successDarkColor}
          width={30}
          alternate_color={false}
        />
      ) : (
        <IconX
          title={text_maker("no")}
          color={window.infobase_color_constants.highlightDark}
          width={30}
          alternate_color={false}
        />
      );

    const column_configs = {
      digital_status_desc: {
        index: 0,
        header: text_maker("digital_status_desc"),
      },
      digital_status: {
        index: 1,
        header: text_maker("online_status"),
        formatter: (value) => get_icon(value),
      },
    };
    return (
      <Panel title={text_maker("service_overview_title")}>
        <div className={"service_overview-container"}>
          <div className="fcol-md-7">
            <div className="service_overview-rect">
              <h3>{service.description}</h3>
            </div>
            <div className={"service_overview-container"}>
              <div className="fcol-md-6 px-lg-0 pl-min-lg-0">
                <div className="service_overview-rect">
                  <h2>{service.service_type}</h2>
                </div>
              </div>
              <div className="fcol-md-6 px-lg-0 pr-min-lg-0">
                <div className="service_overview-rect">
                  <TM
                    el="h4"
                    k={
                      service.collects_fees
                        ? "does_charge_fees"
                        : "does_not_charge_fees"
                    }
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingBottom: "10px",
              }}
              className="service_overview-rect"
            >
              <TM el="h2" k={"standards_performance_text"} />
              <Gauge
                value={_.countBy(standards, "is_target_met").true}
                total_value={standards.length}
              />
            </div>
            <div className="service_overview-rect">
              <FancyUL
                className="service_overview-fancy-ul"
                title={text_maker("identification_methods")}
              >
                {[
                  <div key="cra_as_identifier" className="identifier-li">
                    <TM style={{ lineHeight: 2 }} k="cra_as_identifier" />
                    {get_icon(service.cra_buisnss_number_is_identifier)}
                  </div>,
                  <div key="sin_as_identifier" className="identifier-li">
                    <TM style={{ lineHeight: 2 }} k="sin_as_identifier" />
                    {get_icon(service.sin_is_identifier)}
                  </div>,
                ]}
              </FancyUL>
            </div>
            <div className="service_overview-rect">
              <FancyUL title={text_maker("related_programs")}>
                {_.map(service.program_ids, (program_id) => {
                  const program = Subject.Program.lookup(program_id);
                  return (
                    <a key={program_id} href={infograph_href_template(program)}>
                      {program.name}
                    </a>
                  );
                })}
              </FancyUL>
            </div>
          </div>
          <div className="fcol-md-5">
            <div className="service_overview-rect">
              <TM el="h4" k="digital_status_title" />
              <DisplayTable
                data={_.map(digital_status_keys, (key) => ({
                  digital_status_desc: text_maker(`${key}_desc`),
                  digital_status: service[`${key}_status`],
                }))}
                column_configs={column_configs}
                util_components={{
                  copyCsvUtil: null,
                  downloadCsvUtil: null,
                  columnToggleUtil: null,
                }}
              />
            </div>
            <div className="service_overview-rect">
              <TM
                el="h2"
                k={"service_link_text"}
                args={{ service_url: service.url }}
              />
            </div>
          </div>
        </div>
      </Panel>
    );
  }
}
