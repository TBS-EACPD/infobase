import { gql } from "@apollo/client";
import _ from "lodash";

import { query_factory } from "src/graphql_utils/graphql_utils";

import {
  OrgSobjsFieldsFragmentDoc,
  OrgTransferPaymentsFieldsFragmentDoc,
  OrgVoteStatEstimatesFieldsFragmentDoc,
  OrgVoteStatPaFieldsFragmentDoc,
  ProgramFteFieldsFragmentDoc,
  ProgramSobjsFieldsFragmentDoc,
  ProgramSpendingFieldsFragmentDoc,
  ProgramVoteStatFieldsFragmentDoc,
} from "./_fragments.gql";

const make_slice = ({
  query_name,
  variable_defs,
  selection,
  fragment_doc,
  resolver,
}) => {
  const query = fragment_doc
    ? gql`
        query ${query_name}(${variable_defs}) {
          root(lang: $lang) {
            ${selection}
          }
        }
        ${fragment_doc}
      `
    : gql`
        query ${query_name}(${variable_defs}) {
          root(lang: $lang) {
            ${selection}
          }
        }
      `;

  const api = query_factory()({
    query_name,
    query,
    resolver,
  });

  return {
    promised: api[`promised${query_name}`],
    use: api[`use${query_name}`],
  };
};

const field_fragment = {
  program_spending: ["ProgramSpendingFields", ProgramSpendingFieldsFragmentDoc],
  program_fte: ["ProgramFteFields", ProgramFteFieldsFragmentDoc],
  org_vote_stat_pa: ["OrgVoteStatPaFields", OrgVoteStatPaFieldsFragmentDoc],
  org_vote_stat_estimates: [
    "OrgVoteStatEstimatesFields",
    OrgVoteStatEstimatesFieldsFragmentDoc,
  ],
  org_sobjs: ["OrgSobjsFields", OrgSobjsFieldsFragmentDoc],
  org_transfer_payments: [
    "OrgTransferPaymentsFields",
    OrgTransferPaymentsFieldsFragmentDoc,
  ],
  program_sobjs: ["ProgramSobjsFields", ProgramSobjsFieldsFragmentDoc],
  program_vote_stat: [
    "ProgramVoteStatFields",
    ProgramVoteStatFieldsFragmentDoc,
  ],
};

const subject_slice = (query_name, parent_selection, field) => {
  const [fragment_name, fragment_doc] = field_fragment[field];
  return make_slice({
    query_name,
    variable_defs: parent_selection.variable_defs,
    selection: `${parent_selection.open} ${field} { ...${fragment_name} } ${parent_selection.close}`,
    fragment_doc,
    resolver: (response) => parent_selection.read(response)?.[field],
  });
};

const parents = {
  gov: {
    variable_defs: "$lang: String!",
    open: "gov {",
    close: "}",
    read: (response) => response?.root?.gov,
    variables: () => ({}),
  },
  dept: {
    variable_defs: "$lang: String!, $org_id: String!",
    open: "org(org_id: $org_id) {",
    close: "}",
    read: (response) => response?.root?.org,
    variables: (subject) => ({ org_id: String(subject?.id ?? "") }),
  },
  program: {
    variable_defs: "$lang: String!, $program_id: String!",
    open: "program(id: $program_id) {",
    close: "}",
    read: (response) => response?.root?.program,
    variables: (subject) => ({ program_id: subject?.id ?? "" }),
  },
  crso: {
    variable_defs: "$lang: String!, $crso_id: String!",
    open: "crso(id: $crso_id) {",
    close: "}",
    read: (response) => response?.root?.crso,
    variables: (subject) => ({ crso_id: subject?.id ?? "" }),
  },
};

const slice_fields = {
  gov: [
    "program_spending",
    "program_fte",
    "org_vote_stat_pa",
    "org_vote_stat_estimates",
    "org_sobjs",
    "org_transfer_payments",
  ],
  dept: [
    "program_spending",
    "program_fte",
    "org_vote_stat_pa",
    "org_vote_stat_estimates",
    "org_sobjs",
    "org_transfer_payments",
    "program_sobjs",
  ],
  program: [
    "program_spending",
    "program_fte",
    "program_sobjs",
    "program_vote_stat",
  ],
  crso: ["program_spending", "program_fte"],
};

const query_name_for = (subject_type, field) => {
  const prefix = {
    gov: "Gov",
    dept: "Org",
    program: "Program",
    crso: "Crso",
  }[subject_type];
  const field_name = field
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return `${prefix}${field_name}`;
};

export const finance_slices = _.mapValues(
  slice_fields,
  (fields, subject_type) =>
    _.fromPairs(
      fields.map((field) => [
        field,
        subject_slice(
          query_name_for(subject_type, field),
          parents[subject_type],
          field
        ),
      ])
    )
);

export const slice_variables = _.mapValues(
  parents,
  (parent) => parent.variables
);

export const {
  promised: promisedGovHasFinanceData,
  use: useGovHasFinanceData,
} = make_slice({
  query_name: "GovHasFinanceData",
  variable_defs: "$lang: String!",
  selection: "gov { has_finance_data }",
  resolver: (response) => response?.root?.gov,
});

export const {
  promised: promisedProgramHasFinanceData,
  use: useProgramHasFinanceData,
} = make_slice({
  query_name: "ProgramHasFinanceData",
  variable_defs: "$lang: String!, $program_id: String!",
  selection: "program(id: $program_id) { has_finance_data }",
  resolver: (response) => response?.root?.program,
});

export const {
  promised: promisedCrsoHasFinanceData,
  use: useCrsoHasFinanceData,
} = make_slice({
  query_name: "CrsoHasFinanceData",
  variable_defs: "$lang: String!, $crso_id: String!",
  selection: "crso(id: $crso_id) { has_finance_data }",
  resolver: (response) => response?.root?.crso,
});
