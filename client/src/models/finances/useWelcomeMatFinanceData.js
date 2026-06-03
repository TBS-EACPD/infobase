import _ from "lodash";
import { useQuery } from "@apollo/client";
import { useMemo } from "react";

import { compact_finance_rows } from "src/models/finances/finance_utils";
import { CrsoWelcomeMatFinanceDocument } from "src/models/finances/queries/CrsoWelcomeMatFinance/CrsoWelcomeMatFinance.gql";
import { GovWelcomeMatFinanceDocument } from "src/models/finances/queries/GovWelcomeMatFinance/GovWelcomeMatFinance.gql";
import { OrgWelcomeMatFinanceDocument } from "src/models/finances/queries/OrgWelcomeMatFinance/OrgWelcomeMatFinance.gql";
import { ProgramWelcomeMatFinanceDocument } from "src/models/finances/queries/ProgramWelcomeMatFinance/ProgramWelcomeMatFinance.gql";

import { lang } from "src/core/injected_build_constants";

const query_variables = {
  lang,
  _query_name: "WelcomeMatFinance",
};

export const useWelcomeMatFinanceData = (subject) => {
  const subject_type = subject?.subject_type;

  const gov_query = useQuery(GovWelcomeMatFinanceDocument, {
    variables: { ...query_variables, _query_name: "GovWelcomeMatFinance" },
    skip: subject_type !== "gov",
  });
  const org_query = useQuery(OrgWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      org_id: String(subject?.id),
      _query_name: "OrgWelcomeMatFinance",
    },
    skip: subject_type !== "dept",
  });
  const program_query = useQuery(ProgramWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      program_id: subject?.id,
      _query_name: "ProgramWelcomeMatFinance",
    },
    skip: subject_type !== "program",
  });
  const crso_query = useQuery(CrsoWelcomeMatFinanceDocument, {
    variables: {
      ...query_variables,
      crso_id: subject?.id,
      _query_name: "CrsoWelcomeMatFinance",
    },
    skip: subject_type !== "crso",
  });

  const active_query = (() => {
    switch (subject_type) {
      case "gov":
        return gov_query;
      case "dept":
        return org_query;
      case "program":
        return program_query;
      case "crso":
        return crso_query;
      default:
        return { loading: false, data: undefined, error: undefined };
    }
  })();

  if (active_query.error) {
    throw new Error(JSON.stringify(active_query.error));
  }

  const finance_data = useMemo(() => {
    switch (subject_type) {
      case "gov": {
        const gov = gov_query.data?.root?.gov;
        return {
          program_spending: compact_finance_rows(gov?.program_spending),
          program_fte: compact_finance_rows(gov?.program_fte),
          org_vote_stat_pa: [],
          org_vote_stat_estimates: [],
        };
      }
      case "dept": {
        const org = org_query.data?.root?.org;
        return {
          program_spending: compact_finance_rows(org?.program_spending),
          program_fte: compact_finance_rows(org?.program_fte),
          org_vote_stat_pa: compact_finance_rows(org?.org_vote_stat_pa),
          org_vote_stat_estimates: compact_finance_rows(
            org?.org_vote_stat_estimates
          ),
        };
      }
      case "program": {
        const program = program_query.data?.root?.program;
        return {
          program_spending: compact_finance_rows(program?.program_spending),
          program_fte: compact_finance_rows(program?.program_fte),
          org_vote_stat_pa: [],
          org_vote_stat_estimates: [],
        };
      }
      case "crso": {
        const crso = crso_query.data?.root?.crso;
        return {
          program_spending: compact_finance_rows(crso?.program_spending),
          program_fte: compact_finance_rows(crso?.program_fte),
          org_vote_stat_pa: [],
          org_vote_stat_estimates: [],
        };
      }
      default:
        return {
          program_spending: [],
          program_fte: [],
          org_vote_stat_pa: [],
          org_vote_stat_estimates: [],
        };
    }
  }, [
    subject_type,
    gov_query.data,
    org_query.data,
    program_query.data,
    crso_query.data,
  ]);

  return {
    loading: active_query.loading,
    finance_data,
  };
};
