import text from "./provided_services_list.yaml";
import { Service } from "../../../models/services.js";
import { create_text_maker } from "../../../models/text.js";
import { TM } from "../../../components/index.js";

import { InfographicPanel, declare_panel } from "../shared.js";
import { FancyUL } from "../../../components";

const text_maker = create_text_maker(text);

class ProvidedServicesListPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { query: "" };
  }

  render() {
    const { panel_args } = this.props;

    const filtered_services = _.filter(
      panel_args.services,
      (service) =>
        _.includes(
          service.name.toLowerCase(),
          this.state.query.toLowerCase()
        ) ||
        _.includes(
          service.service_type.toLowerCase(),
          this.state.query.toLowerCase()
        )
    );

    return (
      <div>
        <TM
          tmf={text_maker}
          k="list_of_provided_services_desc"
          args={{
            subject_name: panel_args.subject.name,
            num_of_services: panel_args.services.length,
          }}
        />
        <input
          aria-label={text_maker("explorer_search_is_optional")}
          className="form-control input-lg"
          type="text"
          style={{ width: "100%", marginBottom: "1rem" }}
          placeholder={text_maker("filter_results")}
          onChange={(evt) => this.setState({ query: evt.target.value })}
          value={this.state.query}
        />
        <FancyUL>
          {_.map(
            filtered_services,
            ({ name, id, org_id, service_type, description }) => (
              <React.Fragment key={id}>
                <a href={`#dept/${org_id}/service-panels/${id}`}>{name}</a>
                <p>{description}</p>
                <div
                  style={{
                    display: "flex",
                    fontSize: "14px",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="tag-badge">{service_type}</div>
                  <a href={`#dept/${org_id}/service-panels/${id}`}>
                    <TM tmf={text_maker} k="view_service" />
                  </a>
                </div>
              </React.Fragment>
            )
          )}
        </FancyUL>
      </div>
    );
  }
}

export const declare_provided_services_list_panel = () =>
  declare_panel({
    panel_key: "dept_provided_services_list",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => ({
        subject,
        services: Service.get_by_dept(subject.id),
      }),
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("list_of_provided_services_title")}
            sources={sources}
          >
            <ProvidedServicesListPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
