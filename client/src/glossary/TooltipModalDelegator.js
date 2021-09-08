import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";

import { ModalButton, StatelessModal } from "src/components/index";

export class TooltipModalDelegator extends React.Component {
  replaceWithModalBtn(e) {
    const target =
      e.target.getAttribute("data-toggle") === "tooltip" ? e.target : undefined;
    if (!target) {
      return;
    }
    console.log("target");
    console.log(target);
    console.dir(_.pickBy(target, (attr) => !!attr && !_.isFunction(attr)));

    console.log("nextSibling");
    console.log(target.nextSibling);
    console.log("parentElement");
    console.log(target.parentElement);
    console.dir(
      _.pickBy(target.parentElement, (attr) => !!attr && !_.isFunction(attr))
    );

    // TODO: maybe just use target.firstChild.data? serach up best practices for a11y link titles
    const link_title = "";

    const glossary_item_key = target.dataset.ibttGlossaryKey;

    const modal_content = (
      <a
        href={`https://www.tbs-sct.gc.ca/ems-sgd/edb-bdd/index-basic-eng.html#glossary/${
          glossary_item_key || ""
        }`}
        title={link_title}
      ></a>
    );

    function toggle_modal(bool) {
      this.setState({ showModal: bool });
    }

    // ---- ATTEMPT 2 ----

    const modal = React.createElement(StatelessModal, {
      show: "false",
      body: modal_content,
    });
    target.removeAttribute("data-ibtt-glossary-key");
    target.removeAttribute("data-toggle");
    target.appendChild(ReactDOM.render(modal, document.createElement("span")));

    // ---- ATTEMPT 1 ----

    // const replacement = (
    //   <ModalButton
    //     title={""}
    //     button_text={target.firstChild.data}
    //     show_condition={{ name: "tbd", value: "" }} // TODO: figure out the show_condition
    //   >
    //     {children}
    //   </ModalButton>
    // );

    // const replacement = (
    //   <>
    //     <button onClick={() => toggle_modal(true)}>
    //       <p>{target.firstChild.data}</p>
    //     </button>
    //     <StatelessModal show={false} body={modal_content}></StatelessModal>
    //   </>
    // );
    // console.log("replacement");
    // console.log(replacement);
    // const replacement_node = ReactDOM.render(
    //   replacement,
    //   document.createElement("span")
    // );
    // console.log(replacement_node.innerHTML);
    // console.log(ReactDOMServer.renderToString(replacement));

    // const parent_node = target.parentNode; //TODO: handle cases with no parent node (don't think that will happen?)

    // const new_span = document.createElement("span");

    // target.insertAdjacentHTML("afterend", new_span);

    // new_span.appendChild(
    //   ReactDOM.render(replacement, document.createElement("span"))
    // );

    // parent_node.removeChild(target);
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
