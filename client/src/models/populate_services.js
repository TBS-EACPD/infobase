import { gql, useQuery } from "@apollo/client";

import _ from "lodash";

import { lang } from "src/core/injected_build_constants.js";

import { log_standard_event } from "../core/analytics.js";
import { get_client } from "../graphql_utils/graphql_utils.js";

const all_service_fragments = `
      id
      org_id
      program_ids

      first_active_year
      last_active_year
      is_active      

      name
      description
      service_type
      scope
      target_groups
      feedback_channels
      urls

      last_gender_analysis

      collects_fees
      account_reg_digital_status
      authentication_status
      application_digital_status
      decision_digital_status
      issuance_digital_status
      issue_res_digital_status
      digital_enablement_comment

      service_report {
        service_id
        year
        cra_business_ids_collected
        sin_collected
        phone_inquiry_count
        online_inquiry_count
        online_application_count
        live_application_count
        mail_application_count
        other_application_count
        service_report_comment
      }

      standards {
        standard_id
        service_id
    
        name
    
        last_gcss_tool_year
        channel
        type
        other_type_comment
    
        target_type
        urls
        rtp_urls
        standard_report {
          standard_id
          year
          lower
          count
          met_count
          is_target_met
          standard_report_comment
        }
      }
  `;

const dept_services_query = (service_fragments) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      services: services {
        id
        ${
          _.isUndefined(service_fragments)
            ? all_service_fragments
            : service_fragments
        }
      }
    }
  }
}
`;

const all_services_query = (service_fragments) => gql`
query($lang: String!) {
  root(lang: $lang) {
    orgs {
      services: services {
        org_id
        id
        ${
          _.isUndefined(service_fragments)
            ? all_service_fragments
            : service_fragments
        }
      }
    }
  }
}
`;

const services_query = (query_options) => {
  const { id, service_fragments } = query_options;
  return id === "gov"
    ? all_services_query(service_fragments)
    : dept_services_query(service_fragments);
};

export const prefetch_services = (id) => {
  const client = get_client();
  client.query({
    query: services_query({
      id: id || "gov",
      service_fragments: "",
    }),
    variables: {
      lang,
      id: id || "gov",
      _query_name: "services",
    },
  });
  console.log(client.cache.data.data);
};

export const useServices = (query_options) => {
  const time_at_request = Date.now();
  const { id } = query_options;
  const is_gov = id === "gov";
  const variables = {
    lang,
    id,
  };

  const query = services_query(query_options);
  const res = useQuery(query, { variables });
  const { loading, error, data } = res;
  if (error) {
    const resp_time = Date.now() - time_at_request;
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: "API_QUERY_FAILURE",
      MISC2: `Services, took ${resp_time} ms - ${error.toString()}`,
    });
    throw new Error(error);
  }
  if (!loading) {
    const res_data = is_gov ? data.root.orgs : data.root.org.services;
    const services = is_gov
      ? _.chain(res_data).flatMap("services").compact().uniqBy("id").value()
      : res_data;
    return { ...res, data: services };
  }
  return res;
};
