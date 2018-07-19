import survey_text_bundle from "./survey_link.yaml";
import { create_text_maker } from '../models/text.js';

const survey_tm = create_text_maker(survey_text_bundle);

export class FooterSurveyLinkSetter extends React.Component {
  render(){
    const footer_survey_link = document.querySelector('#footer_survey_link');
    footer_survey_link.innerHTML = survey_tm("survey_link_text");
    footer_survey_link.href = survey_tm("survey_link_href");
    return null;
  }
}