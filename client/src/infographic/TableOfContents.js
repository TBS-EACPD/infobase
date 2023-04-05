import _ from "lodash";
import React from "react";

import { UnlabeledTombstone } from "src/components/index";

import { infographic_href_template } from "./infographic_href_template";

export default class TableOfContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_open: false,
    };
  }
  on_click = () => this.setState({ is_open: !this.state.is_open });
  render() {
    const { subject, active_bubble_id, panel_titles_by_key } = this.props;

    return (
      !_.isEmpty(panel_titles_by_key) && (
        <div
          aria-label="Table of contents"
          style={{
            border: "1px solid",
            position: "fixed",
            display: "inline-block",
            left: "5px",
            top: "110px",
            backgroundColor: "white",
            zIndex: "999",
            boxShadow: "0 1px 2px rgb(43 59 93 / 29%)",
            font: "3px",
            overflow: "auto",
            maxWidth: "150px",
            maxHeight: "580px",
          }}
        >
          <h2 style={{backgroundColor: "blue", color: "white"}}>Table of Contents</h2>
          <UnlabeledTombstone
            items={_.map(panel_titles_by_key, (panel_title, panel_key) => (
              <a
                key={panel_key}
                href={infographic_href_template(subject, active_bubble_id, {
                  panel_key,
                })}
              >
                {panel_title}
              </a>
            ))}
          />
        </div>

        /* <StatelessDetails
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
                position: "fixed",
                left: "5px",
                top: "150px",
                backgroundColor: "white",
                zIndex: "999",
                boxShadow: "0 1px 2px rgb(43 59 93 / 29%)",
                font: "10px"
              }}
            >
              <UnlabeledTombstone
                items={_.map(panel_titles_by_key, (panel_title, panel_key) => (
                  <a
                    key={panel_key}
                    href={infographic_href_template(subject, active_bubble_id, {
                      panel_key,
                    })}
                  >
                    {panel_title}
                  </a>
                ))}
              />
            </div>
          }
          on_click={this.on_click}
          is_open={is_open}
        />
        */
      )
    );
  }
}
