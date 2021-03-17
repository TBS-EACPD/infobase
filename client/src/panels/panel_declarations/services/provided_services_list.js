import _ from "lodash";
import React from "react";

import { FancyUL } from "../../../components";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  HeightClippedGraph,
} from "../shared.js";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

class ProvidedServicesListPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { service_query: "" };
  }

  render() {
    const { panel_args, services } = this.props;
    const { service_query } = this.state;
    const { subject } = panel_args;
    const includes_lowercase = (value, query) =>
      _.includes(value.toLowerCase(), query.toLowerCase());
    const filtered_sorted_data = _.chain(services)
      .filter(
        ({ name, service_type }) =>
          includes_lowercase(name, service_query) ||
          _.find(service_type, (type) =>
            includes_lowercase(type, service_query)
          )
      )
      .sortBy("name")
      .value();

    return (
      <div>
        <TM
          k={
            subject.level === "program"
              ? "list_of_provided_services_prog_desc"
              : "list_of_provided_services_desc"
          }
          className="medium-panel-text"
          args={{
            subject_name: subject.name,
            num_of_services: services.length,
          }}
        />
        <input
          aria-label={text_maker("explorer_search_is_optional")}
          className="form-control input-lg"
          type="text"
          style={{ width: "100%", marginBottom: "1rem", marginTop: "2rem" }}
          placeholder={text_maker("filter_results_service")}
          onChange={(evt) => this.setState({ service_query: evt.target.value })}
          value={service_query}
        />
        <HeightClippedGraph clipHeight={400}>
          <FancyUL>
            {_.map(
              filtered_sorted_data,
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {_.map(service_type, (type) => (
                        <span
                          key={type}
                          className="tag-badge"
                          style={{ marginRight: "1rem" }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <a href={`#dept/${org_id}/service-panels/${id}`}>
                      <button className="btn-ib-primary">
                        <TM k="view_service" />
                      </button>
                    </a>
                  </div>
                </React.Fragment>
              )
            )}
          </FancyUL>
        </HeightClippedGraph>
      </div>
    );
  }
}

export const declare_provided_services_list_panel = () =>
  declare_panel({
    panel_key: "provided_services_list",
    levels: ["dept", "program"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => ({
        subject,
      }),
      footnotes: false,
      render({ calculations, data, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("list_of_provided_services_title")}
            sources={sources}
          >
            <ProvidedServicesListPanel
              services={data}
              panel_args={panel_args}
            />
          </InfographicPanel>
        );
      },
    }),
  });
