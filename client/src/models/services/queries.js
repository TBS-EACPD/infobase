import { gql } from "@apollo/client";
import _ from "lodash";

import { lang } from "src/core/injected_build_constants.ts";

import { query_factory } from "src/graphql_utils/graphql_utils.js";

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

export const { query_org_has_services } = query_factory({
  query_name: "org_has_services",
  query: gql`
    query($lang: String! = "${lang}", $id: String) {
      root(lang: $lang) {
        org(org_id: $id) {
          id
          has_services
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "data.root.org.has_services"),
});

export const { query_program_has_services } = query_factory({
  query_name: "program_has_services",
  query: gql`
    query($lang: String! = "${lang}", $id: String) {
      root(lang: $lang) {
        program(id: $id) {
          id
          has_services
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "data.root.program.has_services"),
});

export const { useSingleService } = query_factory({
  query_name: "single_service",
  query: gql`
    query($lang: String! = "${lang}", $id: String!) {
      root(lang: $lang) {
        service(id: $id){
          ${all_service_fragments}
        }
      }
    }
  `,
  resolver: (response) => _.get(response, "root.service"),
});
