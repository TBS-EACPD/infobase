import '../common_css/fontawesome-svg-styles.scss'; // css needed for survey_link_icon

import { trivial_text_maker } from '../models/text.js';

const footer_link_items = [
  {
    href: trivial_text_maker("survey_link_href"),
    text: trivial_text_maker("survey_link_text") + " " + trivial_text_maker("survey_link_icon"),
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
      .map( link_item => `<li><a href="${link_item.href}">${link_item.text}</a></li>`)
      .reduce( (memo, link_html) => memo + link_html, this.state.static_footer_links)
      .value();
  
    footer_survey_link_ul.innerHTML = links_to_insert;

    return null;
  }
}