import _ from "lodash";
import React from "react";
import { InView } from "react-intersection-observer";
import "intersection-observer";
import ReactResizeDetector from "react-resize-detector/build/withPolyfill";
import { withRouter } from "react-router";

import { create_text_maker } from "src/models/text.js";

import { backgroundColor } from "src/core/color_defs.js";
import { has_local_storage } from "src/core/feature_detection.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { IconPin, IconUnpin } from "src/icons/icons.js";

import text from "./PinnedContent.yaml";

const text_maker = create_text_maker(text);

class _PinnedContent extends React.Component {
  constructor(props) {
    super(props);

    const {
      match: {
        params: { options: panel_link },
      },
      local_storage_name,
    } = props;

    const user_has_enabled_pinning = (() => {
      if (panel_link) {
        // TODO hack for a specific gotcha from infographics, where we want to disable the pinned content there when directly linking to a panel,
        // because the pinned content otherwise hides the linked panel title/is confusing... should be handled somewhere else though, not a PinnedContent concern
        return false;
      } else if (has_local_storage && local_storage_name) {
        try {
          const storage_value = JSON.parse(
            localStorage.getItem(local_storage_name)
          );
          return _.isBoolean(storage_value) ? storage_value : true;
        } catch {
          return true;
        }
      }
    })();

    this.content_ref = React.createRef();

    this.state = {
      user_has_enabled_pinning,
    };
  }

  pin_pressed = () => {
    const { local_storage_name } = this.props;
    const { user_has_enabled_pinning } = this.state;

    has_local_storage &&
      local_storage_name &&
      localStorage.setItem(local_storage_name, !user_has_enabled_pinning);

    this.setState({
      user_has_enabled_pinning: !user_has_enabled_pinning,
      content_height: 0,
    });
  };

  handleKeyDown = (e) => {
    if (e.key === "Tab") {
      this.setState({ user_has_enabled_pinning: false });
    }
  };

  update_content_height = _.debounce(
    () =>
      this.setState({
        content_height: this.content_ref.current.clientHeight,
      }),
    this.props.height_update_delay
  );

  componentDidMount() {
    this.update_content_height();
  }

  componentDidUpdate(prev_props, prev_state) {
    const {
      match: {
        params: { options: panel_link },
      },
    } = this.props;

    const {
      match: {
        params: { options: prev_panel_link },
      },
    } = prev_props;

    !prev_panel_link &&
      panel_link &&
      this.setState({ user_has_enabled_pinning: false });
  }

  componentWillUnmount() {
    this.update_content_height.cancel();
  }

  render() {
    const { user_has_enabled_pinning, content_height } = this.state;
    const { children } = this.props;

    return !is_a11y_mode ? (
      <ReactResizeDetector handleWidth>
        {({ width }) => (
          <InView>
            {({ inView, ref, entry }) => {
              const is_stickied =
                user_has_enabled_pinning &&
                !inView &&
                entry &&
                entry.boundingClientRect.top < 0;

              return (
                // this div with ref is for the intersection check
                <div ref={ref}>
                  {/* this conditional div acts as a placeholder to make scrolling smoother */}
                  {/* before adding this, stickying by "position: fixed" would take it out of the DOM block
                  flow which would bump up the window due to the total block content being shortened.
                  By adding this placeholder div, the height of the total block content remains the same,
                  thus no longer causing the window to jump  */}
                  {is_stickied && <div style={{ height: content_height }} />}
                  {/* this div is for sticky styline, must be flex to include margins onto height */}
                  <div
                    style={{
                      display: "flex",
                      ...(is_stickied && {
                        position: "fixed",
                        top: 0,
                        zIndex: 2001,
                      }),
                    }}
                    ref={this.content_ref}
                    onClick={this.update_content_height}
                  >
                    <div style={{ position: "relative", width: width }}>
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
                            user_has_enabled_pinning ? "unpin" : "pin"
                          )}
                          onKeyDown={this.handleKeyDown}
                        >
                          {user_has_enabled_pinning ? (
                            <IconPin
                              height="25px"
                              width="25px"
                              svg_style={{ verticalAlign: "Top" }}
                              color={backgroundColor}
                              alternate_color="false"
                            />
                          ) : (
                            <IconUnpin
                              height="25px"
                              width="25px"
                              svg_style={{ verticalAlign: "Top" }}
                              color={backgroundColor}
                              alternate_color="false"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </InView>
        )}
      </ReactResizeDetector>
    ) : (
      children
    );
  }
}

_PinnedContent.defaultProps = {
  height_update_delay: 1000,
};

export const PinnedContent = withRouter(_PinnedContent);
