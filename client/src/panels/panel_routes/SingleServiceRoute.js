import React from "react";

import {
  ServiceOverview,
  ServiceChannels,
  ServiceStandards,
  ServiceDigitalStatus,
} from "src/panels/panel_declarations/services/index.js";

import {
  create_text_maker_component,
  SpinnerWrapper,
} from "src/components/index.js";

import { useSingleService } from "src/models/populate_services.js";
import { Subject } from "src/models/subject";

import { StandardRouteContainer } from "src/core/NavComponents.js";

import { infograph_href_template } from "src/link_utils.js";

import text from "./SingleServiceRoute.yaml";

const { text_maker } = create_text_maker_component(text);

const SingleServiceRoute = (props) => {
  const {
    match: {
      params: { service_id, subject_id },
    },
  } = props;
  const { loading, data: service } = useSingleService(service_id);
  if (loading) {
    return <span>loading</span>;
  }
  const subject = Subject.Dept.lookup(subject_id);

  return (
    <StandardRouteContainer
      title={text_maker("single_service_route_title")}
      breadcrumbs={[
        <a
          key="service_route"
          href={infograph_href_template(subject, "services")}
        >
          {subject.name}
        </a>,
        text_maker("single_service_route_title"),
      ]}
      description={text_maker("single_service_route_desc")}
      route_key="single_service_route"
    >
      {loading ? (
        <SpinnerWrapper ref="spinner" config_name={"sub_route"} />
      ) : (
        <div>
          <h1>{service.name}</h1>
          <ServiceOverview service={service} />
          <ServiceDigitalStatus service={service} />
          <ServiceChannels service={service} />
          <ServiceStandards service={service} />
        </div>
      )}
    </StandardRouteContainer>
  );
};

export default SingleServiceRoute;
