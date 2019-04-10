import { rpb_link } from '../rpb/rpb_link.js';

const featured_content_items = _.compact([
  !window.is_a11y_mode && {
    text_key: 'quick_link_youtube_video',
    href: {
      en: "https://www.youtube.com/watch?v=WG1ngAI49Bw",
      fr: "https://www.youtube.com/watch?v=RrvWQJsrSVk",
    }[window.lang],
    is_link_out: true,
    is_youtube: true,
  },
  //{ HI_TODO
  //  text_key: 'quick_link_hi_tags',
  //  href: '#resource-explorer/HI/drr17',
  //  is_new: true,
  //},
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
            fr: "Budget principal des dépenses",
          })[window.lang],
        }) :
        "#compare_estimates"
    ),
    is_new: true,
  },
  {
    text_key: 'quick_link_DP_1920',
    href: "#orgs/gov/gov/infograph/results",
    is_new: true,
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
    is_new: true,
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
    is_new: true,
  },
  !window.is_a11y_mode && {
    text_key: "treemap_home_title",
    href: "#treemap",
  },
  {
    text_key: 'quick_link_DRR_1718',
    href: "#orgs/gov/gov/infograph/results/~(panel_key~'gov_drr)",
  },
  {
    text_key: 'quick_link_auth_and_exp',
    href: rpb_link({ 
      table: 'orgVoteStatPa', 
      mode: 'details',
    }),
  },
]);

export { featured_content_items };