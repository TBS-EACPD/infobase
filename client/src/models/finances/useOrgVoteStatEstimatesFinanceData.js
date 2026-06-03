import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { GovWelcomeMatFinanceDocument } from "src/models/finances/queries/GovWelcomeMatFinance/GovWelcomeMatFinance.gql";
import { OrgWelcomeMatFinanceDocument } from "src/models/finances/queries/OrgWelcomeMatFinance/OrgWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

const query_variables = {
  lang,
  _query_name: "OrgVoteStatEstimatesFinance",
};

export const useOrgVoteStatEstimatesFinanceData = (subject, { with_gov = false } = {}) => {
  const is_dept = subject?.subject_type === "dept";
  const is_gov = subject?.subject_type === "gov";

  const org_query = useQuery(OrgWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      org_id: String(subject?.id),
      _query_name: "OrgWelcomeMatFinance",
    },
    skip: !is_dept,
  });
  const gov_query = useQuery(GovWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      _query_name: "GovWelcomeMatFinance",
    },
    skip: !is_gov && !(with_gov && is_dept),
  });

  if (org_query.error) {
    throw new Error(JSON.stringify(org_query.error));
  }
  if (gov_query.error) {
    throw new Error(JSON.stringify(gov_query.error));
  }

  const finance_data = useMemo(
    () => ({
      org_vote_stat_estimates: compact_finance_rows(
        org_query.data?.root?.org?.org_vote_stat_estimates
      ),
      gov_org_vote_stat_estimates: compact_finance_rows(
        gov_query.data?.root?.gov?.org_vote_stat_estimates
      ),
    }),
    [org_query.data, gov_query.data]
  );

  const loading =
    (is_dept && org_query.loading) ||
    ((is_gov || (with_gov && is_dept)) && gov_query.loading);

  return { loading, finance_data };
};
