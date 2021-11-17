import { gql, useQuery } from "@apollo/client";

import _ from "lodash";

import { log_standard_event } from "src/core/analytics";
import { lang } from "src/core/injected_build_constants";

import { query_factory, get_client } from "src/graphql_utils/graphql_utils";

const all_service_fragments = `
  id
  org_id
  submission_year
  report_years
  program_activity_codes
  first_active_year
  last_active_year

  name
  description
  service_type
  scope
  designations
  target_groups
  feedback_channels
  urls
  digital_identity_platforms
  accessibility_assessors
  recipient_type

  last_gender_analysis
  last_accessibility_review
  last_improve_from_feedback

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
    phone_application_count
    other_application_count
    email_application_count
    fax_application_count
    phone_inquiry_and_application_count
    service_report_comment
  }

  standards {
    standard_id
    service_id
    name

    submission_year
    first_active_year
    last_active_year
    last_gcss_tool_year
    channel
    type
    other_type_comment

    target_type
    standard_urls
    rtp_urls
    standard_report {
      standard_id
      year
      lower
      upper
      count
      met_count
      is_target_met
      standard_report_comment
    }
  }
  `;

const program_services_query = ({ query_fragments }) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    program(id: $id) {
      id
      services {
        id
        ${
          _.isUndefined(query_fragments)
            ? all_service_fragments
            : query_fragments
        }
      }
    }
  }
}
`;

const dept_services_query = ({ query_fragments }) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      id
      services {
        id
        ${
          _.isUndefined(query_fragments)
            ? all_service_fragments
            : query_fragments
        }
      }
    }
  }
}
`;

const all_services_query = ({ query_fragments, services_args }) => gql`
query($lang: String!) {
  root(lang: $lang) {
    orgs {
      services${services_args} {
        org_id
        id
        ${
          _.isUndefined(query_fragments)
            ? all_service_fragments
            : query_fragments
        }
      }
    }
  }
}
`;

const get_subject_has_services_query = (subject_type, id_arg_name) => gql`
query($lang: String! $id: String) {
  root(lang: $lang) {
    ${subject_type}(${id_arg_name}: $id){
      id
      has_services
    }
  }
}
`;

export const api_load_has_services = (subject) => {
  const subject_type = subject && subject.subject_type;

  const { is_loaded, id, query, response_data_accessor } = (() => {
    const has_services_is_loaded = (() => {
      try {
        subject.has_data("services");
      } catch (error) {
        return false;
      }
      return true;
    })();

    switch (subject_type) {
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
  const { subject } = query_options;
  const query_lookup_by_subject_type = {
    gov: all_services_query,
    dept: dept_services_query,
    program: program_services_query,
  };
  return query_lookup_by_subject_type[subject.subject_type](query_options);
};

const get_query_appropirate_subject_type = (subject) =>
  subject.subject_type === "dept" ? "org" : subject.subject_type;

const get_summary_query = (query_options) => {
  const { subject, query_fragment } = query_options;
  const query_by_subject_type = {
    gov: "gov",
    dept: `org(org_id: "${subject.id}")`,
    program: `program(id: "${subject.id}")`,
  };
  return gql`
  query($lang: String!) {
    root(lang: $lang) {
      ${query_by_subject_type[subject.subject_type]} {
        id
        service_summary {
          id
          service_general_stats {
            id
            number_of_services
            num_of_subject_offering_services
            num_of_programs_offering_services
          }
          ${query_fragment ? query_fragment : ""}
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
    return { ...res, data: data.root.service[0] };
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
    const subject_type = get_query_appropirate_subject_type(subject);
    return { ...res, data: data.root[subject_type].service_summary };
  }
  return res;
};

export const useServices = (query_options) => {
  const time_at_request = Date.now();
  const { subject } = query_options;
  const is_gov = subject.subject_type === "gov";
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
    const data_path_by_subject_type = {
      gov: (data) => data.root.orgs,
      dept: (data) => data.root.org.services,
      program: (data) => data.root.program.services,
    };

    const res_data = data_path_by_subject_type[subject.subject_type](data);
    const services = is_gov
      ? _.chain(res_data).flatMap("services").compact().uniqBy("id").value()
      : res_data;
    return { ...res, data: services };
  }
  return res;
};

// TODO the other service queries should be using query_factory and this file should be renamed
export const { query_search_services, useSearchServices } = query_factory({
  query_name: "search_services",
  query: gql`
    query($lang: String! = "${lang}", $search_phrase: String!) {
      root(lang: $lang) {
        search_services(search_phrase: $search_phrase) {
          id
          org_id
          name
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "data.root.search_services"),
});
