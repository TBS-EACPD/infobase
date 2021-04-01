import _ from "lodash";
import React from "react";

import { Details, create_text_maker_component } from "src/components/index.js";

import { infograph_options_href_template } from "./infographic_link.js";

import text from "./TableOfContents.yaml";

const { TM } = create_text_maker_component(text);

export default class TableOfContents extends React.Component {
  render() {
    const { active_bubble_id, panel_keys, subject } = this.props;

    const panel_links =
      active_bubble_id &&
      panel_keys &&
      subject &&
      _.map(
        panel_keys,
        (panel_key) =>
          infograph_options_href_template(subject, active_bubble_id, {
            panel_key: panel_key,
          }) &&
          document.querySelector(
            `#${panel_key} > .panel > .panel-heading > .panel-title`
          ) && {
            link: window.location.href.replace(
              window.location.hash,
              infograph_options_href_template(subject, active_bubble_id, {
                panel_key: panel_key,
              })
            ),
            //Kinda hacky... Should probably find a better way of doing this...
            text: document.querySelector(
              `#${panel_key} > .panel > .panel-heading > .panel-title`
            ).innerText,
            key: panel_key,
          }
      );

    return (
      <Details
        summary_content={
          <div>
            <TM k="table_of_contents" />
            <TM className="panel-status-text" k="skip_to_panel" />
          </div>
        }
        content={_.map(
          panel_links,
          (panel_link) =>
            panel_link && (
              <a
                style={{ display: "block" }}
                href={panel_link.link}
                key={panel_link.key}
              >
                {panel_link.text}
              </a>
            )
        )}
      />
    );
  }
}
