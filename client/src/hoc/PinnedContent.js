import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { InView } from "react-intersection-observer";
import "intersection-observer";
import ReactResizeDetector from "react-resize-detector";
import { withRouter } from "react-router";

import { has_local_storage } from "src/core/feature_detection.js";

import { is_a11y_mode } from "src/app_bootstrap/globals.js";

import { backgroundColor } from "../core/color_defs";
import { IconPin, IconUnpin } from "../icons/icons.js";
import { create_text_maker } from "../models/text.js";

import text from "./PinnedContent.yaml";

const text_maker = create_text_maker(text);

export const PinnedContent = withRouter(
  class extends React.Component {
    constructor(props) {
      super(props);

      const {
        match: {
          params: { options: panel_link },
        },
        local_storage_name,
      } = props;

      let user_enabled_pinning;
      if (has_local_storage) {
        try {
          user_enabled_pinning = JSON.parse(
            localStorage.getItem(local_storage_name)
          );
          user_enabled_pinning = _.isBoolean(user_enabled_pinning)
            ? user_enabled_pinning
            : true;
        } catch {
          user_enabled_pinning = true;
        }
      }

      if (panel_link) {
        user_enabled_pinning = false;
      }

      this.state = {
        user_enabled_pinning: user_enabled_pinning,
      };
    }

    pin_pressed = () => {
      const { local_storage_name } = this.props;
      const { user_enabled_pinning } = this.state;
      localStorage.setItem(local_storage_name, !user_enabled_pinning);
      this.setState({
        user_enabled_pinning: !user_enabled_pinning,
      });
    };

    handleKeyDown = (e) => {
      if (e.key == "Tab") {
        this.setState({ user_enabled_pinning: false });
      }
    };

    render() {
      const { user_enabled_pinning } = this.state;
      const { children } = this.props;

      return !is_a11y_mode ? (
        <ReactResizeDetector handleWidth>
          {({ width }) => (
            <InView>
              {({ inView, ref, entry }) => (
                // this div is for the intersection check
                <div ref={ref}>
                  {/* this div is for sticky styline */}
                  <div
                    className={classNames(
                      !inView &&
                        user_enabled_pinning &&
                        entry &&
                        entry.boundingClientRect.top < 0 &&
                        "sticky"
                    )}
                    style={{
                      width: width,
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      {children}
                      <div
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                        }}
                      >
                        <button
                          onClick={this.pin_pressed}
                          style={{
                            background: "none",
                            border: "none",
                          }}
                          aria-label={text_maker(
                            user_enabled_pinning ? "unpin" : "pin"
                          )}
                          onKeyDown={this.handleKeyDown}
                        >
                          {user_enabled_pinning ? (
                            <IconPin
                              height="25px"
                              width="25px"
                              vertical_align="top"
                              color={backgroundColor}
                              alternate_color="false"
                            />
                          ) : (
                            <IconUnpin
                              height="25px"
                              width="25px"
                              vertical_align="top"
                              color={backgroundColor}
                              alternate_color="false"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </InView>
          )}
        </ReactResizeDetector>
      ) : (
        children
      );
    }
  }
);
