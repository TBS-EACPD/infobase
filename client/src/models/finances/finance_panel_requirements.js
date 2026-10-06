const req = (finance_fields, gov_finance_fields = []) => ({
  finance_fields,
  gov_finance_fields,
});

const spending_and_fte = req(["program_spending", "program_fte"]);

export const FINANCE_PANEL_REQUIREMENTS = {
  welcome_mat: {
    gov: spending_and_fte,
    dept: req([
      "program_spending",
      "program_fte",
      "org_vote_stat_pa",
      "org_vote_stat_estimates",
    ]),
    program: spending_and_fte,
    crso: spending_and_fte,
  },
  planned_actual_comparison: {
    dept: spending_and_fte,
    program: spending_and_fte,
    crso: spending_and_fte,
  },
  gocographic: {
    gov: spending_and_fte,
  },
  auth_exp_planned_spending: {
    gov: req(
      ["org_vote_stat_pa", "org_vote_stat_estimates", "program_spending"],
      ["org_vote_stat_pa"]
    ),
    dept: req([
      "org_vote_stat_pa",
      "org_vote_stat_estimates",
      "program_spending",
    ]),
  },
  in_year_voted_stat_split: {
    gov: req([], ["org_vote_stat_estimates"]),
    dept: req(["org_vote_stat_estimates"]),
  },
  in_year_estimates_split: {
    gov: req([], ["org_vote_stat_estimates"]),
    dept: req(["org_vote_stat_estimates"]),
  },
  estimates_in_perspective: {
    dept: req(["org_vote_stat_estimates"], ["org_vote_stat_estimates"]),
  },
  in_year_voted_breakdown: {
    gov: req([], ["org_vote_stat_estimates"]),
  },
  in_year_stat_breakdown: {
    gov: req([], ["org_vote_stat_estimates"]),
  },
  historical_g_and_c: {
    gov: req(["org_transfer_payments"]),
    dept: req(["org_transfer_payments"]),
  },
  last_year_g_and_c_perspective: {
    dept: req(
      ["org_transfer_payments", "program_spending"],
      ["org_transfer_payments"]
    ),
  },
  spend_by_so_hist: {
    dept: req(["org_sobjs"]),
  },
  personnel_spend: {
    gov: req(["org_sobjs"]),
  },
  spend_rev_split: {
    dept: req(["org_sobjs"]),
    program: req(["program_sobjs"]),
  },
  top_spending_areas: {
    program: req(["program_sobjs"]),
  },
  internal_services: {
    dept: req(["program_fte"], ["program_fte"]),
  },
  detailed_program_spending_split: {
    dept: req(["program_sobjs", "program_spending"]),
  },
  crso_by_prog_fte: {
    crso: spending_and_fte,
  },
  crso_by_prog_exp: {
    crso: spending_and_fte,
  },
  spending_in_tag_perspective: {
    program: req(["program_spending"], ["program_spending"]),
  },
  vote_stat_split: {
    program: req(["program_vote_stat"]),
  },
};

export const panel_finance_config = (panel_key, subject_type) => {
  const requirement = FINANCE_PANEL_REQUIREMENTS[panel_key]?.[subject_type];
  if (!requirement) {
    throw new Error(
      `No finance requirements for panel "${panel_key}" and subject "${subject_type}"`
    );
  }
  return requirement;
};
