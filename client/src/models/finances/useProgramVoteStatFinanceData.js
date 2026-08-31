import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { ProgramWelcomeMatFinanceDocument } from "src/models/finances/queries/ProgramWelcomeMatFinance/ProgramWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

const query_variables = {
  lang,
  _query_name: "ProgramVoteStatFinance",
};

export const useProgramVoteStatFinanceData = (subject) => {
  const program_query = useQuery(ProgramWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      program_id: subject?.id,
      _query_name: "ProgramWelcomeMatFinance",
    },
    skip: subject?.subject_type !== "program",
  });

  if (program_query.error) {
    throw new Error(JSON.stringify(program_query.error));
  }

  const finance_data = useMemo(
    () => ({
      program_vote_stat: compact_finance_rows(
        program_query.data?.root?.program?.program_vote_stat
      ),
    }),
    [program_query.data]
  );

  return {
    loading: program_query.loading,
    finance_data,
  };
};
