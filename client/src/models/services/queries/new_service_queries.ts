import { lang } from "src/core/injected_build_constants";

import { getSuspensedQuery } from "src/graphql_utils/getQuery";

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
export const getServicesForProgram = (id: string) => {
  const data = getSuspensedQuery<
    ServicesForProgramQuery,
    ServicesForProgramQueryVariables
  >(ServicesForProgramDocument, { lang, id });
  return data.root.program?.services;
};
