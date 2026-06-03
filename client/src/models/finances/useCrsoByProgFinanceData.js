import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { CrsoWelcomeMatFinanceDocument } from "src/models/finances/queries/CrsoWelcomeMatFinance/CrsoWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

export const useCrsoByProgFinanceData = (subject) => {
  const crso_query = useQuery(CrsoWelcomeMatFinanceDocument, {
    variables: {
      lang,
      crso_id: subject?.id,
      _query_name: "CrsoWelcomeMatFinance",
    },
    skip: subject?.subject_type !== "crso",
  });

  if (crso_query.error) {
    throw new Error(JSON.stringify(crso_query.error));
  }

  const finance_data = useMemo(() => {
    const crso = crso_query.data?.root?.crso;
    return {
      program_spending: compact_finance_rows(crso?.program_spending),
      program_fte: compact_finance_rows(crso?.program_fte),
    };
  }, [crso_query.data]);

  return {
    loading: crso_query.loading,
    finance_data,
  };
};
