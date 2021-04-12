import _ from "lodash";
import React from "react";

import {
  StatelessDetails,
  create_text_maker_component,
  UnlabeledTombstone,
} from "src/components/index.js";

import { separatorColor } from "src/core/color_defs.js";

import { infograph_options_href_template } from "./infographic_link.js";

import text from "./TableOfContents.yaml";

const { TM } = create_text_maker_component(text);

export default class TableOfContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_open: false,
    };
  }
  on_click = () => this.setState({ is_open: !this.state.is_open });
  render() {
    const {
      active_bubble_id,
      panel_keys,
      subject,
      visible_panel_titles,
    } = this.props;

    const { is_open } = this.state;

    const panel_links =
      active_bubble_id &&
      panel_keys &&
      subject &&
      visible_panel_titles &&
      _.compact(
        _.map(panel_keys, (panel_key) => {
          const link = infograph_options_href_template(
            subject,
            active_bubble_id,
            {
              panel_key: panel_key,
            }
          );
          const title = visible_panel_titles[panel_key];
          return (
            link &&
            title && {
              link,
              title,
              key: panel_key,
            }
          );
        })
      );

    const link_elements =
      !_.isEmpty(panel_links) &&
      _.map(
        panel_links,
        (panel_link) =>
          panel_link && (
            <a
              style={{ margin: "0 5px" }}
              href={panel_link.link}
              key={panel_link.key}
            >
              {panel_link.title}
            </a>
          )
      );
    return (
      link_elements && (
        <StatelessDetails
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
          on_click={this.on_click}
          is_open={is_open}
        />
      )
    );
  }
}
