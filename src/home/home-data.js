import { rpb_link } from '../rpb/rpb_link.js';

export default function(a11y_mode){
  const featured_content_items = [
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
      is_new: true,
    },
    {
      text_key: "home_pop_by_gender",
      href: (
        rpb_link({ 
          table: 'table302', 
          columns: ["{{ppl_last_year}}"], 
        })
      ),
      is_new: true,
    },
    {
      text_key: "home_pop_by_fol",
      href: (
        rpb_link({ 
          table: 'table303', 
          columns: ["{{ppl_last_year}}"], 
        })
      ),
      is_new: true,
    },
    {
      text_key: "home_pop_avg_age",
      href: (
        rpb_link({ 
          table: 'table304', 
          columns: ["{{ppl_last_year}}"], 
        })
      ),
      is_new: true,
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
      is_new: true,
    },
    {
      text_key: "supps_c",
      href: (
        window.is_a11y_mode ? 
          rpb_link({ 
            table: 'table8', 
            columns: [ "{{est_in_year}}_estimates"], 
            dimension: 'by_estimates_doc', 
            filter: ({ //TODO: D.R.Y this against table8
              "en":"Supp. Estimates C",
              "fr":"Budget supp. C",
            })[window.lang],
          }) :
          "#partition/est_doc_sec/planned_exp"
      ),
      is_new: true,
    },
    {
      text_key: "DRR_1617",
      href: rpb_link({ 
        table: 'table12', 
        columns: ['{{pa_last_year}}'], 
        dimension: "gov_goco",
      }),
    },
    (
      window.is_a11y_mode ?
      null :
      {
        text_key: "bubbles_quick_link",
        href: "explore-dept",
      }
    ),
  ];


  return {
    featured_content_items: _.compact(featured_content_items),
  };

};