import _ from "lodash";
import React from "react";

import {
  StatelessDetails,
  create_text_maker_component,
  UnlabeledTombstone,
} from "src/components/index";

import { separatorColor } from "src/style_constants/index";

import { infograph_options_href_template } from "./infographic_link";

import text from "./TableOfContents.yaml";

const { TM } = create_text_maker_component(text);

export default class TableOfContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_open: false,
      active_panel: null,
      previous_href: null,
      active_href: null,
    };
  }

  componentDidMount() {
    const { subject, active_bubble_id } = this.props;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const panel_key = entry.target.parentElement.getAttribute("id");
          const query = `a[href="${infograph_options_href_template(
            subject,
            active_bubble_id,
            { panel_key }
          )}"]`;

          const href = document.querySelector(query);
          if (href) {
            if (entry.intersectionRatio > 0.5) {
              href.classList.add("active");

              const temp = this.state.active_href;
              this.setState({
                active_href: href,
                previous_href: temp,
              });
              this.state.previous_href?.classList.remove("active");
            }
          }
        });
      },
      { threshold: [0, 0.5] }
    );

    setTimeout(() => {
      const panels = document.getElementsByClassName("panel");
      for (const el of panels) {
        observer.observe(el);
      }
    }, 3000);
  }

  on_click = () => this.setState({ is_open: !this.state.is_open });
  render() {
    const { subject, active_bubble_id, panel_titles_by_key } = this.props;

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
                position: "fixed",
                left: "5px",
                top: "150px",
                backgroundColor: "white",
                zIndex: "999",
                boxShadow: "0 1px 2px rgb(43 59 93 / 29%)",
              }}
            >
              <UnlabeledTombstone
                items={_.map(panel_titles_by_key, (panel_title, panel_key) => (
                  <a
                    className={"toc_link"}
                    key={panel_key}
                    href={infograph_options_href_template(
                      subject,
                      active_bubble_id,
                      { panel_key }
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(panel_key).scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
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
      )
    );
  }
}
