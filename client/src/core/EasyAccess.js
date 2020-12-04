import React, { Fragment } from "react";
import ReactDOM from "react-dom";

import { TrivialTM } from "../components/index.js";
import {
  IconAbout,
  IconGlossary,
  IconDataset,
  IconQuestion,
} from "../icons/icons.js";
import { trivial_text_maker } from "../models/text.js";
import "./NavComponents.scss";

export class EasyAccess extends React.Component {
  render() {
    return null;
  }
  componentDidMount() {
    ReactDOM.render(<EasyAccess_ />, document.getElementById("easy-access"));
  }
}
const TM = TrivialTM;

const EasyAccess_ = () => (
  <Fragment>
    <a href="#glossary" className="link-unstyled nav-item">
      <IconGlossary
        title={trivial_text_maker("glossary")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="glossary" />
      </span>
    </a>
    <a href="#metadata" className="link-unstyled nav-item">
      <IconDataset
        title={trivial_text_maker("metadata")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="metadata" />
      </span>
    </a>
    <a href="#about" className="link-unstyled nav-item">
      <IconAbout
        title={trivial_text_maker("about_title")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="about_title" />
      </span>
    </a>
    <a href="#faq" className="link-unstyled nav-item">
      <IconQuestion
        title={trivial_text_maker("faq_title")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="faq_title" />
      </span>
    </a>
  </Fragment>
);
