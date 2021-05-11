import { gql } from "@apollo/client";
import _ from "lodash";

import { lang } from "src/core/injected_build_constants.ts";

import { query_factory } from "src/graphql_utils/graphql_utils.js";

export const { query_org_has_services, useOrgHasServices } = query_factory({
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

export const {
  query_program_has_services,
  useProgramHasServices,
} = query_factory({
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
