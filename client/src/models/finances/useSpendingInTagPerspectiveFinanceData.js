import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { GovWelcomeMatFinanceDocument } from "src/models/finances/queries/GovWelcomeMatFinance/GovWelcomeMatFinance.gql";
import { ProgramWelcomeMatFinanceDocument } from "src/models/finances/queries/ProgramWelcomeMatFinance/ProgramWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

const query_variables = {
  lang,
  _query_name: "SpendingInTagPerspectiveFinance",
};

export const useSpendingInTagPerspectiveFinanceData = (subject) => {
  const program_query = useQuery(ProgramWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      program_id: subject?.id,
      _query_name: "ProgramWelcomeMatFinance",
    },
    skip: subject?.subject_type !== "program",
  });
  const gov_query = useQuery(GovWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      _query_name: "GovWelcomeMatFinance",
    },
    skip: subject?.subject_type !== "program",
  });

  if (program_query.error) {
    throw new Error(JSON.stringify(program_query.error));
  }
  if (gov_query.error) {
    throw new Error(JSON.stringify(gov_query.error));
  }

  const finance_data = useMemo(
    () => ({
      program_spending: compact_finance_rows(
        program_query.data?.root?.program?.program_spending
      ),
      gov_program_spending: compact_finance_rows(
        gov_query.data?.root?.gov?.program_spending
      ),
    }),
    [program_query.data, gov_query.data]
  );

  return {
    loading: program_query.loading || gov_query.loading,
    finance_data,
  };
};
