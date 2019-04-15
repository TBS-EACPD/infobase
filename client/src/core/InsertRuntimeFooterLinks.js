import { trivial_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';

const footer_link_items = [
  {
    href: trivial_text_maker("survey_link_href"),
    text: trivial_text_maker("survey_link_text") + " " + `<img style="stroke: currentColor; width: 20px; height: 20px; vertical-align: -12px; text-align: center;" src=${get_static_url("svg/feedback-icon.svg")} />`,
  },
  {
    href: "#privacy",
    text: trivial_text_maker("privacy_title"),
  },
];

export class InsertRuntimeFooterLinks extends React.Component {
  constructor(){
    super();
    this.state = {
      static_footer_links: document.querySelector('#footer_survey_link_area').innerHTML,
    }
  }
  render(){
    const footer_survey_link_ul = document.querySelector('#footer_survey_link_area');
  
    const links_to_insert = _.chain(footer_link_items)
      .map( link_item => `<li><a href="${link_item.href}" target="_blank" rel="noopener noreferrer">${link_item.text}</a></li>`)
      .reduce( (memo, link_html) => memo + link_html, this.state.static_footer_links)
      .value();
  
    footer_survey_link_ul.innerHTML = links_to_insert;

    return null;
  }
}