import { TrivialTM } from '../components/index.js';
import { trivial_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';
import { Fragment } from 'react';
import { text_maker } from '../tables/table_common.js';

export class EasyAccess extends React.Component {
  render(){ return null; }
  componentDidMount(){
    ReactDOM.render(

      <EasyAccess_ />,
      document.getElementById("easy-access")
    );
  }
}
const TM = TrivialTM;

const EasyAccess_ = () =>
  <Fragment>
    <a href='#glossary'>
      <img
        className="mrgn-rght-sm"
        title={text_maker("glossary")}
        style={{width: "20px", height: "20px", verticalAlign: "-4px"}}
        src={get_static_url("svg/glossary-icon.svg")} 
      />
      <TM k="glossary" />
    </a>
    <a href="#metadata" className="mrgn-lft-md">
      <img
        className="mrgn-rght-sm"
        title={text_maker("metadata")}
        style={{width: "20px", height: "20px", verticalAlign: "-4px"}}
        src={get_static_url("svg/metadata-icon.svg")} 
      />
      <TM k="metadata" />
    </a>
    <a href="#about" className="mrgn-lft-md">
      <img
        className="mrgn-rght-sm"
        title={text_maker("about_title")}
        style={{width: "20px", height: "20px", verticalAlign: "-4px"}}
        src={get_static_url("svg/aboutus-icon.svg")} 
      />
      <TM k="about_title" />
    </a>
    <a href={trivial_text_maker("survey_link_href")} className="mrgn-lft-md">
      <img
        className="mrgn-rght-sm"
        title={text_maker("survey_link_text")}
        style={{width: "20px", height: "20px", verticalAlign: "-4px"}}
        src={get_static_url("svg/feedback-icon.svg")} 
      />
      <TM k="survey_link_text" />
    </a>
  </Fragment>;