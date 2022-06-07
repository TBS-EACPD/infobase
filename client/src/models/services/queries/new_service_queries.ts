import _ from "lodash";

import { lang } from "src/core/injected_build_constants";

import { getSuspensedQuery } from "src/graphql_utils/getQuery";
import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  ServicesForOrgQuery,
  ServicesForOrgQueryVariables,
} from "./ServicesForOrg.gql";
import { ServicesForOrgDocument } from "./ServicesForOrg.gql";
import type {
  ServicesForProgramQueryVariables,
  ServicesForProgramQuery,
} from "./ServicesForProgram.gql";
import { ServicesForProgramDocument } from "./ServicesForProgram.gql";

export const getServicesForOrg = (id: string) => {
  const data = getSuspensedQuery<
    ServicesForOrgQuery,
    ServicesForOrgQueryVariables
  >(ServicesForOrgDocument, { lang, id });
  return data.root.org?.services;
};

const { suspendedServicesForOrg } = query_factory<
  ServicesForOrgQuery,
  ServicesForOrgQueryVariables
>()({
  query_name: "ServicesForOrg",
  query: ServicesForOrgDocument,
  resolver: (response: ServicesForOrgQuery) => response,
});

export const getServicesForProgram = (id: string) => {
  const data = getSuspensedQuery<
    ServicesForProgramQuery,
    ServicesForProgramQueryVariables
  >(ServicesForProgramDocument, { lang, id });
  return data.root.program?.services;
};
