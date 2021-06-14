import _ from "lodash";
import React, { Fragment } from "react";

import { create_text_maker } from "src/models/text";

import { IconArrow } from "src/icons/icons";

import treemap_text from "./TreeMap.yaml";
import "./TreeMap.scss";

const text_maker = create_text_maker([treemap_text]);

const top_level_title = `${text_maker("government_stats")}`;

const BreadcrumbArrow = (
  <IconArrow svg_style={{ verticalAlign: "0.1em" }} inline={true} />
);

interface TreeMapTopBarProps {
  history: {
    action: string;
    block: Function;
    createHref: Function;
    go: Function;
    goBack: Function;
    goForward: Function;
    length: number;
    listen: Function;
    location: {
      hash: string;
      pathname: string;
      search: string;
      state: undefined;
    };
    push: Function;
    replace: Function;
  };
  org_route: [];
  setRouteCallback: Function;
}
export class TreeMapTopBar extends React.Component<TreeMapTopBarProps> {
  constructor(props: TreeMapTopBarProps) {
    super(props);
  }
  handleClick(ix: number) {
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
                  tabIndex={0}
                  dangerouslySetInnerHTML={{ __html: top_level_title }}
                  onClick={() => {
                    this.handleClick(-1);
                  }}
                  onKeyDown={(event) => {
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
                    tabIndex={0}
                    dangerouslySetInnerHTML={{ __html: display }}
                    onClick={() => {
                      this.handleClick(ix);
                    }}
                    onKeyDown={(event) => {
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
