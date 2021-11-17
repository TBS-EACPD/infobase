import _ from "lodash";
import React from "react";

import { DisplayTable, LeafSpinner } from "src/components/index";

import { useServices } from "src/models/populate_services";
import { Gov } from "src/models/subjects";

import { StandardRouteContainer } from "src/core/NavComponents";

import { infograph_href_template } from "src/infographic/infographic_link";

const ServiceInventory = () => {
  const { loading, data } = useServices({
    subject: Gov.instance,
    services_args: `(submission_year: "2019")`,
    query_fragments: `
    id
    org_id
    name
    service_type
    target_groups
    programs {
      subject_type
      id
      name
    }
    `,
  });
  if (loading) {
    return <LeafSpinner config_name="sub_route" />;
  }
  const processed_data = _.map(data, ({ id, service_type, target_groups }) => ({
    name: id,
    service_type: _.join(service_type, "<>"),
    target_groups: _.join(target_groups, "<>"),
    programs: id,
  }));
  const service_map = _.chain(data)
    .map(({ id, name, org_id, programs }) => [
      id,
      {
        name: name,
        href: `#dept/${org_id}/service-panels/${id}?`,
        programs,
      },
    ])
    .fromPairs()
    .value();
  const column_configs = {
    name: {
      index: 0,
      header: "Name",
      is_searchable: true,
      plain_formatter: (id) => service_map[id].name,
      formatter: (id) => {
        const service = service_map[id];
        return <a href={service.href}>{service.name}</a>;
      },
    },
    programs: {
      index: 1,
      header: "Programs",
      is_searchable: true,
      plain_formatter: (service_id) =>
        _.chain(service_map[service_id].programs).map("name").join(" ").value(),
      formatter: (service_id) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {_.chain(service_map[service_id].programs)
            .map((program) => {
              return (
                program && (
                  <a
                    key={`${service_id}-${program.id}`}
                    href={infograph_href_template(program, "services")}
                  >
                    {program.name}
                  </a>
                )
              );
            })
            .value()}
        </div>
      ),
    },
    service_type: {
      index: 2,
      header: "Type",
      is_searchable: true,
      formatter: (types) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {_.chain(types)
            .split("<>")
            .map((type) => <span key={type}>{type}</span>)
            .value()}
        </div>
      ),
    },
    target_groups: {
      index: 3,
      header: "Target groups",
      is_searchable: true,
      formatter: (target_groups) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {_.chain(target_groups)
            .split("<>")
            .map((target_group) => (
              <span key={target_group}>{target_group}</span>
            ))
            .value()}
        </div>
      ),
    },
  };

  return (
    <StandardRouteContainer
      title={"Service Inventory"}
      breadcrumbs={["Service Inventory"]}
      description={"Browse full list of services"}
      route_key="service_inventory"
    >
      <div>
        <h1>Service Inventory</h1>
        <DisplayTable data={processed_data} column_configs={column_configs} />
      </div>
    </StandardRouteContainer>
  );
};

export default ServiceInventory;
