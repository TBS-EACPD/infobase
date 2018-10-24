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
              "en":"Supp. Estimates A",
              "fr":"Budget supp. A",
            })[window.lang],
          }) :
          "#compare_estimates"
      ),
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
      text_key: "home_pop_by_exec",
      href: (
        rpb_link({ 
          table: 'table112', 
          columns: ["{{ppl_last_year}}"],
          dimension: "ex_level_condensed",
          filter: ({
            "en": "Executive",
            "fr": "Cadres supérieurs",
          })[window.lang],
        })
      ),
    },
    {
      text_key: "home_pop_by_gender",
      href: (
        rpb_link({ 
          table: 'table302', 
          columns: ["{{ppl_last_year}}"], 
        })
      ),
    },
    {
      text_key: "home_pop_by_fol",
      href: (
        rpb_link({ 
          table: 'table303', 
          columns: ["{{ppl_last_year}}"], 
        })
      ),
    },
    {
      text_key: "home_pop_avg_age",
      href: (
        rpb_link({ 
          table: 'table304', 
          columns: ["{{ppl_last_year}}"], 
        })
      ),
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
  ];


  return {
    featured_content_items: _.compact(featured_content_items),
  };

};