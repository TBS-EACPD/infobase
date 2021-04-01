import React from "react";

import { Details, create_text_maker_component } from "src/components/index.js";

import { infograph_options_href_template } from "./infographic_link.js";

import text from "./TableOfContents.yaml";

const { TM } = create_text_maker_component(text);

export default class TableOfContents extends React.Component {
  render() {
    const { active_bubble_id, panel_keys, subject } = this.props;

    const panel_link =
      active_bubble_id &&
      panel_key &&
      infograph_options_href_template(subject, active_bubble_id, {
        panel_key: panel_key,
      }) &&
      window.location.href.replace(
        window.location.hash,
        infograph_options_href_template(subject, active_bubble_id, {
          panel_key: panel_key,
        })
      );

    return (
      <Details
        summary_content={
          <div>
            <TM k="table_of_contents" />
            <TM className="panel-status-text" k="skip_to_panel" />
          </div>
        }
        content={"test"}
      />
    );
  }
}
