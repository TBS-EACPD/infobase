import { select } from "d3-selection";
import React from "react";
import ReactDOM from "react-dom";

import { AutoAccordion } from "../../components/index.js";

import { text_maker } from "./partition_text_provider.js";

export class PartitionNotes extends React.Component {
  constructor() {
    super();
  }
  componentDidMount() {
    const autoAccordion = select(ReactDOM.findDOMNode(this.refs.autoAccordion));
    autoAccordion.select(".pull-down-accordion-header").node().click();
  }
  render() {
    const { note_content } = this.props;
    return (
      <div className="mrgn-bttm-sm">
        <AutoAccordion
          title={text_maker("some_things_to_keep_in_mind")}
          ref="autoAccordion"
        >
          <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
            {note_content}
          </div>
        </AutoAccordion>
      </div>
    );
  }
}
