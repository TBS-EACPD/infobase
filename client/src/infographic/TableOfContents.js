import _ from "lodash";
import React from "react";

import {
  Details,
  create_text_maker_component,
  UnlabeledTombstone,
} from "src/components/index.js";

import { infograph_options_href_template } from "./infographic_link.js";

import text from "./TableOfContents.yaml";

const { TM } = create_text_maker_component(text);

export default class TableOfContents extends React.Component {
  render() {
    const { active_bubble_id, panel_keys, subject } = this.props;

    const panel_links = _.compact(
      active_bubble_id &&
        panel_keys &&
        subject &&
        _.map(panel_keys, (panel_key) => {
          const link = infograph_options_href_template(
            subject,
            active_bubble_id,
            {
              panel_key: panel_key,
            }
          );

          const title_element = document.querySelector(
            `#${panel_key} > .panel > .panel-heading > .panel-title`
          );

          return (
            link &&
            title_element &&
            title_element.innerText && {
              link: link,
              //Kinda hacky... Should probably find a better way of doing this...
              text: title_element.innerText,
              key: panel_key,
            }
          );
        })
    );

    const link_elements = _.map(
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
    );

    return (
      <Details
        summary_content={
          <div>
            <TM k="table_of_contents" />
            <TM className="panel-status-text" k="skip_to_panel" />
          </div>
        }
        content={<UnlabeledTombstone items={link_elements} />}
      />
    );
  }
}
