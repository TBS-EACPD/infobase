import _ from "lodash";

import React from "react";

import { UnlabeledTombstone, StatelessDetails, create_text_maker_component} from "src/components/index";

import { infographic_href_template } from "./infographic_href_template";

import text from "./TableOfContents.yaml";

const { TM } = create_text_maker_component(text);

export default class TableOfContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_open: true,
      active_page: null,
      previous_href: null,
      active_href: null,
    };
  }

  updateTableofContents() {
    const { subject, active_bubble_id } = this.props;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const panel_key = entry.target.parentElement.getAttribute("id");
          const query = `a[href="${infographic_href_template(
            subject,
            active_bubble_id,
            { panel_key }
          )}"]`;

          const href = document.querySelector(query);
          if (href) {
            if (entry.intersectionRatio > 0.4) {
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
      { threshold: [0, 0.4] }
    );

    setTimeout(() => {
      const panels = document.getElementsByClassName("panel");
      for (const el of panels) {
        observer.observe(el);
      }
    }, 2500);
  }

  componentDidMount() {
    this.setState({ active_page: this.props.active_bubble_id });
    this.updateTableofContents();
  }

  componentDidUpdate() {
    if (this.props.active_bubble_id != this.state.active_page) {
      this.setState({ active_page: this.props.active_bubble_id });
      this.updateTableofContents();
    }
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
          <h2
            style={{
              backgroundColor: "rgb(44, 112, 201)",
              color: "white",
              display: "flex",
              textAlign: "center",
              fontSize: "1.2em",
              fontWeight: "500",
            }}
          >
            <TM k="table_of_contents" />{" "}
          </h2>
          <UnlabeledTombstone
            items={_.map(panel_titles_by_key, (panel_title, panel_key) => (
              <a
                className={"toc_link"}
                key={panel_key}
                href={infographic_href_template(subject, active_bubble_id, {
                  panel_key,
                })}
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
