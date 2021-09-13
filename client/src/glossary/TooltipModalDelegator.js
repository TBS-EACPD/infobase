import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import { get_glossary_item_tooltip_html } from "src/models/glossary";

import { StatelessModal } from "src/components/index";

export class TooltipModalDelegator extends React.Component {
  replaceWithModalBtn(e) {
    const target =
      e.target.getAttribute("data-toggle") === "tooltip" ? e.target : undefined;
    if (!target) {
      return;
    }
    console.log("\ntarget");
    console.log(target);
    console.dir(_.pickBy(target, (attr) => !!attr && !_.isFunction(attr)));
    console.log("parentElement");
    console.dir(
      _.pickBy(target.parentElement, (attr) => !!attr && !_.isFunction(attr))
    );

    const glossary_item_key = target.dataset.ibttGlossaryKey;

    const glossary_def_html = get_glossary_item_tooltip_html(glossary_item_key);

    let glossary_def = document.createElement("div");
    glossary_def.innerHTML = glossary_def_html;
    console.log("glossary_def");
    console.log(glossary_def);
    console.dir(
      _.pickBy(glossary_def, (attr) => !!attr && !_.isFunction(attr))
    );
    console.log("textContent:", glossary_def.textContent);

    function toggle_modal(bool) {
      console.log("toggle_modal");
      //   this.setState({ showModal: bool });
    }

    const modal = React.createElement(StatelessModal, {
      // not sure why, but modal only shows up when show is string
      show: "false",
      body: glossary_def.innerText, // using glossary_def gives an error
      on_close_callback: () => toggle_modal(false),
    });

    console.log("new child");
    console.dir(
      _.pickBy(
        ReactDOM.render(modal, document.createElement("span")),
        (attr) => !!attr && !_.isFunction(attr)
      )
    );

    target.removeAttribute("data-ibtt-glossary-key");
    target.removeAttribute("data-toggle");
    target.replaceChildren(
      ReactDOM.render(modal, document.createElement("span"))
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
