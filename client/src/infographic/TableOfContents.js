import _ from "lodash";
import React from "react";

import {
  Details,
  create_text_maker_component,
  UnlabeledTombstone,
} from "src/components/index.js";

import { separatorColor } from "src/core/color_defs.js";

import { infograph_options_href_template } from "./infographic_link.js";

import text from "./TableOfContents.yaml";

const { TM } = create_text_maker_component(text);

export default class TableOfContents extends React.Component {
  state = {
    initial_open: false,
  };

  handle_click = () => {
    this.setState((prev_state) => ({
      initial_open: !prev_state.initial_open,
    }));
  };

  render() {
    const {
      active_bubble_id,
      panel_keys,
      subject,
      loading,
      mounted,
    } = this.props;
    const { initial_open } = this.state;

    const panel_links =
      !loading &&
      mounted &&
      active_bubble_id &&
      panel_keys &&
      subject &&
      _.compact(
        _.map(panel_keys, (panel_key) => {
          const link = infograph_options_href_template(
            subject,
            active_bubble_id,
            {
              panel_key: panel_key,
            }
          );

          //Kinda hacky... Should probably find a better way of doing this...
          const title_element = document.querySelector(
            `#${panel_key} > .panel > .panel-heading > .panel-title`
          );

          return (
            link &&
            title_element &&
            title_element.innerText && {
              link: link,
              text: title_element.innerText,
              key: panel_key,
            }
          );
        })
      );

    const link_elements =
      panel_links &&
      _.map(
        panel_links,
        (panel_link) =>
          panel_link && (
            <a
              style={{ margin: "0 5px" }}
              href={panel_link.link}
              key={panel_link.key}
            >
              {panel_link.text}
            </a>
          )
      );

    return (
      link_elements && (
        <div onClick={this.handle_click}>
          <Details
            summary_content={
              <div>
                <TM k="table_of_contents" />{" "}
                <TM className="panel-status-text" k="skip_to_panel" />
              </div>
            }
            content={
              <div
                style={{
                  border: "1px solid",
                  borderColor: separatorColor,
                  borderRadius: "5px",
                }}
              >
                <UnlabeledTombstone items={link_elements} />
              </div>
            }
            initialOpen={initial_open}
          />
        </div>
      )
    );
  }
}
