import _ from "lodash";

import React from "react";

import { UnlabeledTombstone } from "src/components/index";

import { infographic_href_template } from "./infographic_href_template";

export default class TableOfContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_open: false,
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
            if (entry.intersectionRatio > 0.5) {
              href.classList.add("active");
              console.log(this.state.active_href);
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
    }, 1500);
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
          <h2 style={{ backgroundColor: "blue", color: "white" }}>
            Table of Contents
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
      )
    );
  }
}
