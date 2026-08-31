import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { OrgWelcomeMatFinanceDocument } from "src/models/finances/queries/OrgWelcomeMatFinance/OrgWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

export const useDetailedProgramSpendingSplitFinanceData = (subject) => {
  const org_query = useQuery(OrgWelcomeMatFinanceDocument, {
    variables: {
      lang,
      org_id: String(subject?.id),
      _query_name: "OrgWelcomeMatFinance",
    },
    skip: subject?.subject_type !== "dept",
  });

  if (org_query.error) {
    throw new Error(JSON.stringify(org_query.error));
  }

  const finance_data = useMemo(() => {
    const org = org_query.data?.root?.org;
    return {
      program_sobjs: compact_finance_rows(org?.program_sobjs),
      program_spending: compact_finance_rows(org?.program_spending),
    };
  }, [org_query.data]);

  return {
    loading: org_query.loading,
    finance_data,
  };
};
