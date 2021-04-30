import _ from "lodash";
import React from "react";

import {
  StatelessDetails,
  create_text_maker_component,
  UnlabeledTombstone,
  LinkStyled,
} from "src/components/index.js";

import { separatorColor } from "src/core/color_defs.ts";

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
      panel_titles_by_key,
      scroll_to_panel_when_all_loading_done,
    } = this.props;

    const { is_open } = this.state;

    return (
      !_.isEmpty(panel_titles_by_key) && (
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
              <UnlabeledTombstone
                items={_.map(panel_titles_by_key, (panel_title, panel_key) => (
                  <LinkStyled
                    key={panel_key}
                    on_click={() =>
                      scroll_to_panel_when_all_loading_done(panel_key)
                    }
                  >
                    {panel_title}
                  </LinkStyled>
                ))}
              />
            </div>
          }
          on_click={this.on_click}
          is_open={is_open}
        />
      )
    );
  }
}
