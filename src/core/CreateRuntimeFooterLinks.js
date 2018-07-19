import { trivial_text_maker } from '../models/text.js';

export class CreateRuntimeFooterLinks extends React.Component {
  render(){
    const footer_survey_link_ul = document.querySelector('#footer_survey_link_area');
    footer_survey_link_ul.innerHTML += `<li><a href="${trivial_text_maker("survey_link_href")}">${trivial_text_maker("survey_link_text")}</a></li>`;
    return null;
  }
}