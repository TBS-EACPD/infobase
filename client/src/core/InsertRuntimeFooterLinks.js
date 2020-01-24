import { trivial_text_maker, run_template } from '../models/text.js';
import { index_lang_lookups } from '../InfoBase/index_data.js';

const footer_link_items = _.compact([
  {
    href: "#privacy",
    text: trivial_text_maker("privacy_title"),
  },
  !window.is_a11y_mode && {
    id: "footer-a11y-link",
    href: index_lang_lookups.a11y_version_url[window.lang],
    text: index_lang_lookups.a11y_version_title[window.lang],
  },
  window.is_a11y_mode && {
    id: "footer-standard-link",
    href: index_lang_lookups.standard_version_url[window.lang],
    text: index_lang_lookups.standard_version_title[window.lang],
  },
  {
    href: run_template("{{survey_link}}"),
    text: trivial_text_maker("survey_link_text"),
  },
]);

export class InsertRuntimeFooterLinks extends React.Component {
  constructor(){
    super();
    this.state = {
      static_footer_links: document.querySelector('#footer_survey_link_area').innerHTML,
    };
  }
  render(){
    const footer_survey_link_ul = document.querySelector('#footer_survey_link_area');
  
    const links_to_insert = _.chain(footer_link_items)
      .map( ({id, href, text}) => `<li><a ${id ? `id="${id}"` : ""} href="${href}" target="_blank" rel="noopener noreferrer">${text}</a></li>`)
      .reduce( (memo, link_html) => memo + link_html, this.state.static_footer_links)
      .value();
  
    footer_survey_link_ul.innerHTML = links_to_insert;

    return null;
  }
}