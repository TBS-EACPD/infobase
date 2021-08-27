import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";

import { ModalButton } from "src/components/index";

export class TooltipModalDelegator extends React.Component {
  replaceWithModalBtn(e) {
    const target =
      e.target.getAttribute("data-toggle") === "tooltip" ? e.target : undefined;
    if (!target) {
      return;
    }
    console.log("target");
    console.log(target);
    console.dir(_.pickBy(target, _.identity));

    console.log("nextSibling");
    console.log(target.nextSibling);
    console.log("parentElement");
    console.log(target.parentElement);
    console.log("parentNode");
    console.log(target.parentNode);

    const link_title = "";

    const glossary_item_key = target.dataset.ibttGlossaryKey;

    const children = (
      <a
        href={`https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-basic-eng.html#glossary/${
          glossary_item_key || ""
        }`}
        title={link_title}
      ></a>
    );

    const replacement = (
      //   <Router>
      <ModalButton
        title={""}
        button_text={target.firstChild.data}
        show_condition={{ name: "tbd", value: "" }}
      >
        {children}
      </ModalButton>
      //   </Router>
    );

    target.insertAdjacentElement(
      "afterend",
      ReactDOM.render(replacement, document.createElement("div"))
    );
  }

  componentDidMount() {
    window.addEventListener("click", this.replaceWithModalBtn);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.replaceWithModalBtn);
  }

  render() {
    return this.props.children;
  }
}
