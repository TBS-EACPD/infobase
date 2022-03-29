import React, { Fragment } from "react";
import ReactDOM from "react-dom";

import { TrivialTM } from "src/components/index";

import { trivial_text_maker } from "src/models/text";

import {
  IconInfo,
  IconGlossary,
  IconDataset,
  IconQuestion,
} from "src/icons/icons";

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
        aria_label={trivial_text_maker("glossary")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="glossary" />
      </span>
    </a>
    <a href="#datasets" className="link-unstyled nav-item">
      <IconDataset
        aria_label={trivial_text_maker("datasets")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="datasets" />
      </span>
    </a>
    <a href="#about" className="link-unstyled nav-item">
      <IconInfo
        aria_label={trivial_text_maker("about_title")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="about_title" />
      </span>
    </a>
    <a href="#faq" className="link-unstyled nav-item">
      <IconQuestion
        aria_label={trivial_text_maker("faq_title")}
        inline={true}
        aria_hide={true}
      />
      <span className="mrgn-lft-sm">
        <TM k="faq_title" />
      </span>
    </a>
  </Fragment>
);
