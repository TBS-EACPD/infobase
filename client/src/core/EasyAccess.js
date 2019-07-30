import { TrivialTM } from '../components/index.js';
import { trivial_text_maker } from '../models/text.js';
import { Fragment } from 'react';
import {
  IconFeedback,
  IconAbout,
  IconGlossary,
  IconDataset,
} from '../icons/icons.js';
import './NavComponents.scss';

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
    <a
      href='#glossary'
      className="link-unstyled nav-item">
      <IconGlossary title={trivial_text_maker("glossary")} />
      <span className="mrgn-lft-sm">
        <TM k="glossary" />
      </span>
    </a>
    <a
      href="#metadata"
      className="mrgn-lft-md link-unstyled nav-item"
    >
      <IconDataset title={trivial_text_maker("metadata")} />
      <span className="mrgn-lft-sm">
        <TM k="metadata" />
      </span>
    </a>
    <a
      href="#about"
      className="mrgn-lft-md link-unstyled nav-item"
    >
      <IconAbout title={trivial_text_maker("about_title")} />
      <span className="mrgn-lft-sm">
        <TM k="about_title" />
      </span>
    </a>
    <a
      href={trivial_text_maker("survey_link_href")}
      className="mrgn-lft-md link-unstyled nav-item"
    >
      <IconFeedback title={trivial_text_maker("survey_link_text")} />
      <span className="mrgn-lft-sm">
        <TM k="survey_link_text" />
      </span>
    </a>
  </Fragment>;