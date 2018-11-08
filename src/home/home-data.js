import { rpb_link } from '../rpb/rpb_link.js';

export default function(a11y_mode){
  const featured_content_items = [
    {
      text_key: "supps_a",
      href: (
        window.is_a11y_mode ? 
          rpb_link({ 
            table: 'table8', 
            columns: [ "{{est_in_year}}_estimates"], 
            dimension: 'by_estimates_doc', 
            filter: ({ //TODO: D.R.Y this against table8
              "en": "Supp. Estimates A",
              "fr": "Budget supp. A",
            })[window.lang],
          }) :
          "#compare_estimates"
      ),
      is_new: true,
    },
    {
      text_key: "home_people_data_quicklink",
      href: "#orgs/gov/gov/infograph/people",
      is_new: true,
    },
    {
      text_key: "home_who_we_help_quicklink",
      href: "#resource-explorer/WWH/dp18",
      is_new: true,
    },
    {
      text_key: "DP_1819",
      href: rpb_link({ 
        table: 'table6', 
        columns: ['{{planning_year_1}}'], 
        dimension: "gov_goco",
      }),
    },
    {
      text_key: "main_estimates",
      href: (
        window.is_a11y_mode ? 
          rpb_link({ 
            table: 'table8', 
            columns: [ "{{est_in_year}}_estimates"], 
            dimension: 'by_estimates_doc', 
          }) :
          "#partition/est_doc_mains/planned_exp"
      ),
    },
    {
      text_key: "DRR_1617",
      href: rpb_link({ 
        table: 'table12', 
        columns: ['{{pa_last_year}}'], 
        dimension: "gov_goco",
      }),
    },
    {
      text_key: "igoc",
      href: "#igoc",
    },
  ];


  return {
    featured_content_items: _.compact(featured_content_items),
  };

};