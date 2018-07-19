import { trivial_text_maker } from '../models/text.js';

export class FooterSurveyLinkSetter extends React.Component {
  render(){
    const footer_survey_link = document.querySelector('#footer_survey_link');
    footer_survey_link.innerHTML = trivial_text_maker("survey_link_text");
    footer_survey_link.href = trivial_text_maker("survey_link_href");
    return null;
  }
}