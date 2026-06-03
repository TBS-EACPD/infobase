import { query_factory } from "src/graphql_utils/graphql_utils";

import type {
  CrsoWelcomeMatFinanceQuery,
  CrsoWelcomeMatFinanceQueryVariables,
} from "./CrsoWelcomeMatFinance/CrsoWelcomeMatFinance.gql";
import { CrsoWelcomeMatFinanceDocument } from "./CrsoWelcomeMatFinance/CrsoWelcomeMatFinance.gql";
import type {
  DeptHasFinanceDataQuery,
  DeptHasFinanceDataQueryVariables,
} from "./DeptHasFinanceData/DeptHasFinanceData.gql";
import { DeptHasFinanceDataDocument } from "./DeptHasFinanceData/DeptHasFinanceData.gql";
import type {
  GovWelcomeMatFinanceQuery,
  GovWelcomeMatFinanceQueryVariables,
} from "./GovWelcomeMatFinance/GovWelcomeMatFinance.gql";
import { GovWelcomeMatFinanceDocument } from "./GovWelcomeMatFinance/GovWelcomeMatFinance.gql";
import type {
  OrgWelcomeMatFinanceQuery,
  OrgWelcomeMatFinanceQueryVariables,
} from "./OrgWelcomeMatFinance/OrgWelcomeMatFinance.gql";
import { OrgWelcomeMatFinanceDocument } from "./OrgWelcomeMatFinance/OrgWelcomeMatFinance.gql";
import type {
  ProgramWelcomeMatFinanceQuery,
  ProgramWelcomeMatFinanceQueryVariables,
} from "./ProgramWelcomeMatFinance/ProgramWelcomeMatFinance.gql";
import { ProgramWelcomeMatFinanceDocument } from "./ProgramWelcomeMatFinance/ProgramWelcomeMatFinance.gql";

export const {
  promisedGovWelcomeMatFinance,
  suspendedGovWelcomeMatFinance,
  useGovWelcomeMatFinance,
} = query_factory<
  GovWelcomeMatFinanceQuery,
  GovWelcomeMatFinanceQueryVariables
>()({
  query_name: "GovWelcomeMatFinance",
  query: GovWelcomeMatFinanceDocument,
  resolver: (response) => response?.root?.gov,
});

export const {
  promisedOrgWelcomeMatFinance,
  suspendedOrgWelcomeMatFinance,
  useOrgWelcomeMatFinance,
} = query_factory<
  OrgWelcomeMatFinanceQuery,
  OrgWelcomeMatFinanceQueryVariables
>()({
  query_name: "OrgWelcomeMatFinance",
  query: OrgWelcomeMatFinanceDocument,
  resolver: (response) => response?.root?.org,
});

export const {
  promisedProgramWelcomeMatFinance,
  suspendedProgramWelcomeMatFinance,
  useProgramWelcomeMatFinance,
} = query_factory<
  ProgramWelcomeMatFinanceQuery,
  ProgramWelcomeMatFinanceQueryVariables
>()({
  query_name: "ProgramWelcomeMatFinance",
  query: ProgramWelcomeMatFinanceDocument,
  resolver: (response) => response?.root?.program,
});

export const {
  promisedCrsoWelcomeMatFinance,
  suspendedCrsoWelcomeMatFinance,
  useCrsoWelcomeMatFinance,
} = query_factory<
  CrsoWelcomeMatFinanceQuery,
  CrsoWelcomeMatFinanceQueryVariables
>()({
  query_name: "CrsoWelcomeMatFinance",
  query: CrsoWelcomeMatFinanceDocument,
  resolver: (response) => response?.root?.crso,
});

export const {
  promisedDeptHasFinanceData,
  suspendedDeptHasFinanceData,
  useDeptHasFinanceData,
} = query_factory<DeptHasFinanceDataQuery, DeptHasFinanceDataQueryVariables>()({
  query_name: "DeptHasFinanceData",
  query: DeptHasFinanceDataDocument,
  resolver: (response) => response?.root?.org,
});
