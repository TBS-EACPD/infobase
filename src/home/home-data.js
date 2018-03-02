import { rpb_link } from '../rpb/rpb_link.js';
import { text_maker } from '../models/text.js';

export default function(a11y_mode){
  const featured_content_items = [
    {
      text_key: "interim_mains",
      href: rpb_link({ 
        table: 'table8', 
        columns: [ "{{est_next_year}}_estimates"], 
        dimension: 'by_estimates_doc', 
      }),
      is_new: true,
    },
    {
      text_key: "supps_c",
      href: rpb_link({ 
        table: 'table8', 
        columns: [ "{{est_in_year}}_estimates"], 
        dimension: 'by_estimates_doc', 
        filter: ({ //TODO: D.R.Y this against table8
          "en":"Supp. Estimates C",
          "fr":"Budget supp. C",
        })[window.lang],
      }),
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
    {
      text_key:"table4_home_link",
      href: rpb_link({ 
        table: 'table4', 
        columns: ['{{pa_last_year}}auth','{{pa_last_year}}exp'], 
        mode: 'details',
      }),
    },
    {
      text_key: "DP_1718",
      href: rpb_link({ 
        table: 'table6', 
        columns: ['{{planning_year_1}}'], 
        dimension: "gov_goco",
      }),
    },
    { 
      text_key: 'prog_by_vote_stat',
      href : rpb_link({ 
        table: 'table300', 
        mode: 'details',
      }),
    },
    { 
      text_key: 'prog_by_so',
      href : rpb_link({ 
        table: 'table305', 
        mode: 'details',
      }),
    },
  ];


  return {
    featured_content_items,
  };

};