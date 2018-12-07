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
  !window.is_a11y_mode && {
    text_key: "treemap_home_title",
    href: "#treemap",
    is_new: true,
  },
  {
    text_key: 'quick_link_hi_tags',
    href: '#resource-explorer/HI/drr17',
    is_new: true,
  },
  {
    text_key: "interim_mains",
    href: (
      window.is_a11y_mode ? 
        rpb_link({ 
          table: 'table8', 
          columns: ["{{est_next_year}}_estimates"], 
          dimension: 'by_estimates_doc', 
          filter: ({ //TODO: D.R.Y this against table8
            en: "Interim Estimates",
            fr: "Budget provisoire des dépenses",
          })[window.lang],
        }) :
        "#partition/est_doc_ie/planned_exp"
    ),
  },
  {
    text_key: "supps_b",
    href: (
      window.is_a11y_mode ? 
        rpb_link({ 
          table: 'table8', 
          columns: ["{{est_in_year}}_estimates"], 
          dimension: 'by_estimates_doc', 
          filter: ({ //TODO: D.R.Y this against table8
            en: "Supp. Estimates B",
            fr: "Budget supp. B",
          })[window.lang],
        }) :
        "#compare_estimates"
    ),
  },
  {
    text_key: 'quick_link_DRR_1718',
    href: '#orgs/gov/gov/infograph/results',
  },
  {
    text_key: 'quick_link_auth_and_exp',
    href: rpb_link({ 
      table: 'orgVoteStatPa', 
      mode: 'details',
    }),
  },
  {
    text_key: 'quick_link_exp_by_so',
    href: rpb_link({ 
      table: 'orgSobjs', 
      mode: 'details',
    }),
  },
  {
    text_key: 'quick_link_spending_by_program',
    href: rpb_link({ 
      table: 'programSpending', 
      mode: 'details',
    }),
  },
]);

export { featured_content_items };