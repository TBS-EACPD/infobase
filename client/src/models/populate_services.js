import { gql, useQuery } from "@apollo/client";

import _ from "lodash";

import { log_standard_event } from "src/core/analytics";
import { lang } from "src/core/injected_build_constants";

import { get_client } from "src/graphql_utils/graphql_utils";

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

const program_services_query = (service_fragments) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    program(id: $id) {
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

const get_subject_has_services_query = (level, id_arg_name) => gql`
query($lang: String! $id: String) {
  root(lang: $lang) {
    ${level}(${id_arg_name}: $id){
      id
      has_services
    }
  }
}
`;

export const api_load_has_services = (subject) => {
  const level = subject && subject.level;

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const has_services_is_loaded = (() => {
      try {
        subject.has_data("services");
      } catch (error) {
        return false;
      }
      return true;
    })();

    switch (level) {
      case "dept":
        return {
          is_loaded: has_services_is_loaded,
          id: String(subject.id),
          query: get_subject_has_services_query("org", "org_id"),
          response_data_accessor: (response) => response.data.root.org,
        };
      case "program":
        return {
          is_loaded: has_services_is_loaded,
          id: String(subject.id),
          query: get_subject_has_services_query("program", "id"),
          response_data_accessor: (response) => {
            return response.data.root.program;
          },
        };
      default:
        return {
          is_loaded: true, // no default case, this is to resolve the promise early
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      query,
      variables: {
        lang,
        id,
        _query_name: "subject_has_services",
      },
    })
    .then((response) => {
      const response_data = response_data_accessor(response);

      const resp_time = Date.now() - time_at_request;
      if (!_.isEmpty(response_data)) {
        // Not a very good test, might report success with unexpected data... ah well, that's the API's job to test!
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_SUCCESS",
          MISC2: `Has services, took ${resp_time} ms`,
        });
      } else {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "API_QUERY_UNEXPECTED",
          MISC2: `Has services, took ${resp_time} ms`,
        });
      }
      subject.set_has_data("services", response_data[`has_services`]);

      return Promise.resolve();
    })
    .catch(function (error) {
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Has services, took ${time_at_request} ms - ${error.toString()}`,
      });
      throw error;
    });
};
const get_services_query = (query_options) => {
  const { subject, query_fragments } = query_options;
  const query_lookup_by_subject_level = {
    gov: all_services_query,
    dept: dept_services_query,
    program: program_services_query,
  };
  return query_lookup_by_subject_level[subject.level](query_fragments);
};

const get_query_appropirate_level = (subject) =>
  subject.level === "dept" ? "org" : subject.level;

const get_summary_query = (query_options) => {
  const { subject, query_fragment } = query_options;
  const query_by_level = {
    gov: "gov",
    dept: `org(org_id: "${subject.id}")`,
    program: `program(id: "${subject.id}")`,
  };
  return gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${query_by_level[subject.level]} {
        id
        service_summary {
          id
          service_general_stats {
            id
            number_of_services
          }
          ${query_fragment}
        }
      }
    }
  }
  `;
};

export const useSingleService = (service_id) => {
  const time_at_request = Date.now();
  const query = gql`
  query($lang: String!) {
    root(lang: $lang) {
      service(id: "${service_id}"){
        ${all_service_fragments}
      }
    }
  }
  `;
  const res = useQuery(query, {
    variables: {
      lang,
    },
  });
  const { loading, error, data } = res;
  if (error) {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: "API_QUERY_FAILURE",
      MISC2: `Service, took ${time_at_request} ms - ${error.toString()}`,
    });
    throw new Error(error);
  }
  if (!loading) {
    return { ...res, data: data.root.service };
  }
  return res;
};

export const useSummaryServices = (query_options) => {
  const time_at_request = Date.now();
  const { subject } = query_options;
  const query = get_summary_query(query_options);
  const res = useQuery(query, {
    variables: {
      lang,
    },
  });
  const { loading, error, data } = res;
  if (error) {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: "API_QUERY_FAILURE",
      MISC2: `Services, took ${time_at_request} ms - ${error.toString()}`,
    });
    throw new Error(error);
  }
  if (!loading) {
    const level = get_query_appropirate_level(subject);
    return { ...res, data: data.root[level].service_summary };
  }
  return res;
};

export const useServices = (query_options) => {
  const time_at_request = Date.now();
  const { subject } = query_options;
  const is_gov = subject.id === "gov";
  const variables = {
    lang,
    id: String(subject.id),
  };

  const query = get_services_query(query_options);
  const res = useQuery(query, { variables });
  const { loading, error, data } = res;
  if (error) {
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: "API_QUERY_FAILURE",
      MISC2: `Services, took ${time_at_request} ms - ${error.toString()}`,
    });
    throw new Error(error);
  }
  if (!loading) {
    const data_path_by_subject_level = {
      gov: (data) => data.root.orgs,
      dept: (data) => data.root.org.services,
      program: (data) => data.root.program.services,
    };

    const res_data = data_path_by_subject_level[subject.level](data);
    const services = is_gov
      ? _.chain(res_data).flatMap("services").compact().uniqBy("id").value()
      : res_data;
    return { ...res, data: services };
  }
  return res;
};
