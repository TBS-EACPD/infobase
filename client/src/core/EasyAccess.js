import { TrivialTM } from '../util_components.js';
import { trivial_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';
import { Fragment } from 'react';

export class EasyAccess extends React.Component {
  render(){ return null; }
  componentDidMount(){
    ReactDOM.render(

      <EasyAccess_ />,
      document.getElementById("easy-access")
    )
  }
}
const TM = TrivialTM;

const EasyAccess_ = () =>
  <Fragment>
    <a href='#glossary'>
      <TM k="glossary" />
    </a>
    <a
      href="#metadata"
      className="mrgn-lft-md"
    >
      <TM k="metadata" />
    </a>
    <a
      href="#about"
      className="mrgn-lft-md"
    >
      <TM k="about_title" />
    </a>
    <a
      href={trivial_text_maker("survey_link_href")}
      className="mrgn-lft-md"
    >
      <TM k="survey_link_text" />
      <img
        style={{width: "20px", height: "20px", verticalAlign: "-4px"}}
        src={get_static_url("svg/feedback-icon.svg")} 
      />
    </a>
  </Fragment>;