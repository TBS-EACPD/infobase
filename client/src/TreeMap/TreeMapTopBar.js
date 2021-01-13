import _ from "lodash";
import React, { Fragment } from "react";

import { IconArrow } from "../icons/icons.js";
import { create_text_maker } from "../models/text.js";

import treemap_text from "./TreeMap.yaml";
import "./TreeMap.scss";

const text_maker = create_text_maker([treemap_text]);

const top_level_title = `${text_maker("government_stats")}`;

const BreadcrumbArrow = <IconArrow vertical_align="0.1em" inline="true" />;

export class TreeMapTopbar extends React.Component {
  constructor() {
    super();
  }
  handleClick(ix) {
    this.props.setRouteCallback(this.props.org_route.slice(0, ix + 1), true);
  }
  render() {
    const { org_route } = this.props;
    return (
      <div className="TreeMap__ZoomControl">
        <ol
          className="breadcrumb"
          style={{
            background: "none",
            padding: "10px",
            margin: "0px",
          }}
        >
          {_.isEmpty(org_route) ? (
            <li className="TreeMap__ZoomControl--no-zoom-out">
              <span dangerouslySetInnerHTML={{ __html: top_level_title }} />
            </li>
          ) : (
            <Fragment>
              <li
                className="TreeMap__ZoomControl--no-zoom-out"
                style={{ paddingRight: "10px" }}
              >
                {text_maker("click_to_zoom_out")}:
              </li>
              <li className="TreeMap__ZoomControl--has-zoom-out">
                <span
                  tabIndex="0"
                  dangerouslySetInnerHTML={{ __html: top_level_title }}
                  onClick={() => {
                    this.handleClick(-1);
                  }}
                  onKeyDown={() => {
                    if (event.keyCode != 13) {
                      return;
                    }
                    this.handleClick(-1);
                  }}
                />
              </li>
            </Fragment>
          )}
          {_.map(org_route.slice(0, -1), (display, ix) => (
            <Fragment key={ix}>
              <li aria-hidden="true">{BreadcrumbArrow}</li>
              <li className="TreeMap__ZoomControl--has-zoom-out">
                {
                  <span
                    tabIndex="0"
                    dangerouslySetInnerHTML={{ __html: display }}
                    onClick={() => {
                      this.handleClick(ix);
                    }}
                    onKeyDown={() => {
                      if (event.keyCode != 13) {
                        return;
                      }
                      this.handleClick(ix);
                    }}
                  />
                }
              </li>
            </Fragment>
          ))}
          {!_.isEmpty(org_route) && (
            <Fragment>
              <li aria-hidden="true">{BreadcrumbArrow}</li>
              <li className="TreeMap__ZoomControl--no-zoom-out">
                {
                  <span
                    dangerouslySetInnerHTML={{
                      __html: org_route[org_route.length - 1],
                    }}
                  />
                }
              </li>
            </Fragment>
          )}
        </ol>
      </div>
    );
  }
}
