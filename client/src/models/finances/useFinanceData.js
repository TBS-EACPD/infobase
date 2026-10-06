import { useMemo } from "react";

import { FINANCE_PANEL_REQUIREMENTS } from "./finance_panel_requirements";
import { compact_finance_rows } from "./finance_utils";
import {
  empty_finance_data,
  get_loaded_finance_data,
  gov_store_key,
  has_loaded_finance_fields,
} from "./loaded_finance_data";
import { finance_slices, slice_variables } from "./queries/slices";

const useSlice = (subject_type, field, subject, skip) => {
  const slice = finance_slices[subject_type][field];
  return slice.use(slice_variables[subject_type](subject), { skip });
};

export const useFinanceData = (subject, panel_key) => {
  const subject_type = subject?.subject_type;
  const requirement = FINANCE_PANEL_REQUIREMENTS[panel_key]?.[subject_type] || {
    finance_fields: [],
    gov_finance_fields: [],
  };
  const fields = requirement.finance_fields;
  const gov_fields = requirement.gov_finance_fields;

  const needsSlice = (slice_subject_type, field) =>
    subject_type === slice_subject_type &&
    fields.includes(field) &&
    !!finance_slices[slice_subject_type]?.[field];
  const needs_gov = (field) =>
    gov_fields.includes(field) ||
    (subject_type === "gov" && fields.includes(field));

  const gov_program_spending = useSlice(
    "gov",
    "program_spending",
    subject,
    !needs_gov("program_spending")
  );
  const gov_program_fte = useSlice(
    "gov",
    "program_fte",
    subject,
    !needs_gov("program_fte")
  );
  const gov_org_vote_stat_pa = useSlice(
    "gov",
    "org_vote_stat_pa",
    subject,
    !needs_gov("org_vote_stat_pa")
  );
  const gov_org_vote_stat_estimates = useSlice(
    "gov",
    "org_vote_stat_estimates",
    subject,
    !needs_gov("org_vote_stat_estimates")
  );
  const gov_org_sobjs = useSlice(
    "gov",
    "org_sobjs",
    subject,
    !needs_gov("org_sobjs")
  );
  const gov_org_transfer_payments = useSlice(
    "gov",
    "org_transfer_payments",
    subject,
    !needs_gov("org_transfer_payments")
  );

  const dept_program_spending = useSlice(
    "dept",
    "program_spending",
    subject,
    !needsSlice("dept", "program_spending")
  );
  const dept_program_fte = useSlice(
    "dept",
    "program_fte",
    subject,
    !needsSlice("dept", "program_fte")
  );
  const dept_org_vote_stat_pa = useSlice(
    "dept",
    "org_vote_stat_pa",
    subject,
    !needsSlice("dept", "org_vote_stat_pa")
  );
  const dept_org_vote_stat_estimates = useSlice(
    "dept",
    "org_vote_stat_estimates",
    subject,
    !needsSlice("dept", "org_vote_stat_estimates")
  );
  const dept_org_sobjs = useSlice(
    "dept",
    "org_sobjs",
    subject,
    !needsSlice("dept", "org_sobjs")
  );
  const dept_org_transfer_payments = useSlice(
    "dept",
    "org_transfer_payments",
    subject,
    !needsSlice("dept", "org_transfer_payments")
  );
  const dept_program_sobjs = useSlice(
    "dept",
    "program_sobjs",
    subject,
    !needsSlice("dept", "program_sobjs")
  );

  const program_program_spending = useSlice(
    "program",
    "program_spending",
    subject,
    !needsSlice("program", "program_spending")
  );
  const program_program_fte = useSlice(
    "program",
    "program_fte",
    subject,
    !needsSlice("program", "program_fte")
  );
  const program_program_sobjs = useSlice(
    "program",
    "program_sobjs",
    subject,
    !needsSlice("program", "program_sobjs")
  );
  const program_program_vote_stat = useSlice(
    "program",
    "program_vote_stat",
    subject,
    !needsSlice("program", "program_vote_stat")
  );

  const crso_program_spending = useSlice(
    "crso",
    "program_spending",
    subject,
    !needsSlice("crso", "program_spending")
  );
  const crso_program_fte = useSlice(
    "crso",
    "program_fte",
    subject,
    !needsSlice("crso", "program_fte")
  );

  const local_queries = {
    dept: {
      program_spending: dept_program_spending,
      program_fte: dept_program_fte,
      org_vote_stat_pa: dept_org_vote_stat_pa,
      org_vote_stat_estimates: dept_org_vote_stat_estimates,
      org_sobjs: dept_org_sobjs,
      org_transfer_payments: dept_org_transfer_payments,
      program_sobjs: dept_program_sobjs,
    },
    program: {
      program_spending: program_program_spending,
      program_fte: program_program_fte,
      program_sobjs: program_program_sobjs,
      program_vote_stat: program_program_vote_stat,
    },
    crso: {
      program_spending: crso_program_spending,
      program_fte: crso_program_fte,
    },
    gov: {
      program_spending: gov_program_spending,
      program_fte: gov_program_fte,
      org_vote_stat_pa: gov_org_vote_stat_pa,
      org_vote_stat_estimates: gov_org_vote_stat_estimates,
      org_sobjs: gov_org_sobjs,
      org_transfer_payments: gov_org_transfer_payments,
    },
  };

  const gov_queries = {
    program_spending: gov_program_spending,
    program_fte: gov_program_fte,
    org_vote_stat_pa: gov_org_vote_stat_pa,
    org_vote_stat_estimates: gov_org_vote_stat_estimates,
    org_sobjs: gov_org_sobjs,
    org_transfer_payments: gov_org_transfer_payments,
  };

  const active_queries = [
    ...fields.map((field) => local_queries[subject_type]?.[field]),
    ...gov_fields.map((field) => gov_queries[field]),
  ].filter(Boolean);

  const queries_ready = active_queries.every((query) => !query.loading);
  const store_ready = has_loaded_finance_fields(subject, fields, gov_fields);

  const finance_data = useMemo(() => {
    if (!queries_ready) {
      return get_loaded_finance_data(subject) || empty_finance_data();
    }

    const rows_by_subject_type = {
      gov: {
        program_spending: gov_program_spending.data,
        program_fte: gov_program_fte.data,
        org_vote_stat_pa: gov_org_vote_stat_pa.data,
        org_vote_stat_estimates: gov_org_vote_stat_estimates.data,
        org_sobjs: gov_org_sobjs.data,
        org_transfer_payments: gov_org_transfer_payments.data,
      },
      dept: {
        program_spending: dept_program_spending.data,
        program_fte: dept_program_fte.data,
        org_vote_stat_pa: dept_org_vote_stat_pa.data,
        org_vote_stat_estimates: dept_org_vote_stat_estimates.data,
        org_sobjs: dept_org_sobjs.data,
        org_transfer_payments: dept_org_transfer_payments.data,
        program_sobjs: dept_program_sobjs.data,
      },
      program: {
        program_spending: program_program_spending.data,
        program_fte: program_program_fte.data,
        program_sobjs: program_program_sobjs.data,
        program_vote_stat: program_program_vote_stat.data,
      },
      crso: {
        program_spending: crso_program_spending.data,
        program_fte: crso_program_fte.data,
      },
    };
    const gov_rows = {
      program_spending: gov_program_spending.data,
      program_fte: gov_program_fte.data,
      org_vote_stat_pa: gov_org_vote_stat_pa.data,
      org_vote_stat_estimates: gov_org_vote_stat_estimates.data,
      org_sobjs: gov_org_sobjs.data,
      org_transfer_payments: gov_org_transfer_payments.data,
    };

    const data = empty_finance_data();
    fields.forEach((field) => {
      data[field] = compact_finance_rows(
        rows_by_subject_type[subject_type]?.[field]
      );
    });
    gov_fields.forEach((field) => {
      data[gov_store_key(field)] = compact_finance_rows(gov_rows[field]);
    });
    return data;
  }, [
    queries_ready,
    subject,
    subject_type,
    fields,
    gov_fields,
    gov_program_spending.data,
    gov_program_fte.data,
    gov_org_vote_stat_pa.data,
    gov_org_vote_stat_estimates.data,
    gov_org_sobjs.data,
    gov_org_transfer_payments.data,
    dept_program_spending.data,
    dept_program_fte.data,
    dept_org_vote_stat_pa.data,
    dept_org_vote_stat_estimates.data,
    dept_org_sobjs.data,
    dept_org_transfer_payments.data,
    dept_program_sobjs.data,
    program_program_spending.data,
    program_program_fte.data,
    program_program_sobjs.data,
    program_program_vote_stat.data,
    crso_program_spending.data,
    crso_program_fte.data,
  ]);

  return {
    loading: !queries_ready && !store_ready,
    finance_data,
  };
};
