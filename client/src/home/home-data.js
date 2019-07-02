
const featured_content_items = _.compact([
  {
    text_key: 'quick_link_people_2019',
    href: '#orgs/gov/gov/infograph/people',
    is_new: true,
  },
  {
    text_key: 'quick_link_budget_2019',
    href: '#budget-tracker/budget-measure/overview/budget-2019',
  },
  {
    text_key: 'quick_link_hi_tags',
    href: '#resource-explorer/HI/dp19',
  },
  {
    text_key: "quick_link_main_estimates",
    href: (
      window.is_a11y_mode ? 
        rpb_link({ 
          table: 'table8', 
          columns: ["{{est_in_year}}_estimates"], 
          dimension: 'by_estimates_doc', 
          filter: ({ //TODO: D.R.Y this against table8
            en: "Main Estimates",
            fr: "Budget principal",
          })[window.lang],
        }) :
        "#compare_estimates"
    ),
  },
  {
    text_key: 'quick_link_DP_1920',
    href: "#orgs/gov/gov/infograph/results",
  },
  {
    text_key: 'quick_link_planned_spending_by_program',
    href: window.is_a11y_mode ? 
      rpb_link({ 
        table: 'programSpending', 
        columns: ["{{planning_year_1}}","{{planning_year_2}}","{{planning_year_3}}"],
        mode: 'details',
      }) :
      "#treemap/drf/spending/All/planning_year_1",
  },
  {
    text_key: 'quick_link_planned_ftes_by_program',
    href: window.is_a11y_mode ?
      rpb_link({ 
        table: 'programFtes', 
        columns: ["{{planning_year_1}}","{{planning_year_2}}","{{planning_year_3}}"],
        mode: 'details',
      }) :
      "#treemap/drf_ftes/ftes/All/planning_year_1",
  },
  !window.is_a11y_mode && {
    text_key: "treemap_home_title",
    href: "#treemap",
  },
]);

export { featured_content_items };