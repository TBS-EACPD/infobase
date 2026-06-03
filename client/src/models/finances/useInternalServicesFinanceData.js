import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { GovWelcomeMatFinanceDocument } from "src/models/finances/queries/GovWelcomeMatFinance/GovWelcomeMatFinance.gql";
import { OrgWelcomeMatFinanceDocument } from "src/models/finances/queries/OrgWelcomeMatFinance/OrgWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

const query_variables = {
  lang,
  _query_name: "InternalServicesFinance",
};

export const useInternalServicesFinanceData = (subject) => {
  const org_query = useQuery(OrgWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      org_id: String(subject?.id),
      _query_name: "OrgWelcomeMatFinance",
    },
    skip: subject?.subject_type !== "dept",
  });
  const gov_query = useQuery(GovWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      _query_name: "GovWelcomeMatFinance",
    },
    skip: subject?.subject_type !== "dept",
  });

  if (org_query.error) {
    throw new Error(JSON.stringify(org_query.error));
  }
  if (gov_query.error) {
    throw new Error(JSON.stringify(gov_query.error));
  }

  const finance_data = useMemo(
    () => ({
      org_program_fte: compact_finance_rows(
        org_query.data?.root?.org?.program_fte
      ),
      gov_program_fte: compact_finance_rows(
        gov_query.data?.root?.gov?.program_fte
      ),
    }),
    [org_query.data, gov_query.data]
  );

  return {
    loading: org_query.loading || gov_query.loading,
    finance_data,
  };
};
