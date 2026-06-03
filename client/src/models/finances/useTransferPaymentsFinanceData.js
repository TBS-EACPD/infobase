import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { GovWelcomeMatFinanceDocument } from "src/models/finances/queries/GovWelcomeMatFinance/GovWelcomeMatFinance.gql";
import { OrgWelcomeMatFinanceDocument } from "src/models/finances/queries/OrgWelcomeMatFinance/OrgWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

const query_variables = {
  lang,
  _query_name: "TransferPaymentsFinance",
};

export const useTransferPaymentsFinanceData = (
  subject,
  { with_gov = false } = {}
) => {
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

  const finance_data = useMemo(() => {
    if (is_dept) {
      const org = org_query.data?.root?.org;
      return {
        org_transfer_payments: compact_finance_rows(
          org?.org_transfer_payments
        ),
        gov_org_transfer_payments: compact_finance_rows(
          gov_query.data?.root?.gov?.org_transfer_payments
        ),
        program_spending: compact_finance_rows(org?.program_spending),
      };
    }

    const gov = gov_query.data?.root?.gov;
    return {
      org_transfer_payments: compact_finance_rows(gov?.org_transfer_payments),
      gov_org_transfer_payments: compact_finance_rows(
        gov?.org_transfer_payments
      ),
      program_spending: compact_finance_rows(gov?.program_spending),
    };
  }, [is_dept, org_query.data, gov_query.data]);

  const loading =
    (is_dept && (org_query.loading || (with_gov && gov_query.loading))) ||
    (is_gov && gov_query.loading);

  return { loading, finance_data };
};
