import { lang } from "src/core/injected_build_constants";

import { useSuspensedQuery } from "src/graphql_utils/useSuspensedQuery";

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

export const useServicesForOrg = (id: string) => {
  const { data } = useSuspensedQuery<
    ServicesForOrgQuery,
    ServicesForOrgQueryVariables
  >(ServicesForOrgDocument, { lang, id });
  return data?.root.org?.services;
};
export const useServicesForProgram = (id: string) => {
  const { data } = useSuspensedQuery<
    ServicesForProgramQuery,
    ServicesForProgramQueryVariables
  >(ServicesForProgramDocument, { lang, id });
  return data?.root.program?.services;
};
