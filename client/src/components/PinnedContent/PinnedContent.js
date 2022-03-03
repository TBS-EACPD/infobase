import _ from "lodash";
import React from "react";
import { InView } from "react-intersection-observer";
import "intersection-observer";
import ReactResizeDetector from "react-resize-detector/build/withPolyfill";

import { create_text_maker } from "src/models/text";

import { has_local_storage } from "src/core/feature_detection";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconPin, IconUnpin } from "src/icons/icons";
import { backgroundColor } from "src/style_constants/index";

import text from "./PinnedContent.yaml";

const text_maker = create_text_maker(text);

export const get_pinned_content_local_storage = (local_storage_name) => {
  try {
    return has_local_storage && local_storage_name
      ? JSON.parse(localStorage.getItem(local_storage_name))
      : null;
  } catch {
    return null;
  }
};
export const set_pinned_content_local_storage = (local_storage_name, value) => {
  has_local_storage &&
    local_storage_name &&
    localStorage.setItem(local_storage_name, value);
};

class _PinnedContent extends React.Component {
  constructor(props) {
    super(props);

    this.content_ref = React.createRef();

    this.state = {
      is_pinned_local_storage_mirror: null,
    };
  }

  get is_pinned() {
    const { local_storage_name, default_pin_state } = this.props;
    const { is_pinned_local_storage_mirror } = this.state;

    if (has_local_storage && local_storage_name) {
      const is_pinned = get_pinned_content_local_storage(local_storage_name);
      return _.isBoolean(is_pinned) ? is_pinned : default_pin_state;
    } else {
      return _.isBoolean(is_pinned_local_storage_mirror)
        ? is_pinned_local_storage_mirror
        : default_pin_state;
    }
  }

  set_is_pinned = (is_pinned) => {
    set_pinned_content_local_storage(this.props.local_storage_name, is_pinned);
    this.setState({ is_pinned_local_storage_mirror: is_pinned });
  };
  pin_pressed = () => {
    this.set_is_pinned(!this.is_pinned);
  };
  handleKeyDown = (e) => {
    if (e.key === "Tab") {
      this.set_is_pinned(false);
    }
  };

  componentDidMount() {
    this.set_is_pinned(this.is_pinned);
  }

  render() {
    const { children } = this.props;

    return (
      <InView>
        {({ inView, ref, entry }) => {
          const should_pin =
            this.is_pinned &&
            !inView &&
            entry &&
            entry.boundingClientRect.top < 0;

          return (
            <div ref={ref}>
              <ReactResizeDetector handleHeight>
                {({ targetRef }) => (
                  <>
                    {should_pin && (
                      <div style={{ height: targetRef.current.offsetHeight }} />
                    )}
                    <div
                      style={{
                        ...(should_pin && {
                          position: "fixed",
                          top: 0,
                          zIndex: 2001,
                        }),
                      }}
                      ref={targetRef}
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
                              !this.is_pinned ? "pin" : "unpin"
                            )}
                            onKeyDown={this.handleKeyDown}
                          >
                            {!this.is_pinned ? (
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
                  </>
                )}
              </ReactResizeDetector>
            </div>
          );
        }}
      </InView>
    );
  }
}
_PinnedContent.defaultProps = {
  default_pin_state: has_local_storage,
};

export class PinnedContent extends React.Component {
  render() {
    return is_a11y_mode ? (
      this.props.children
    ) : (
      <_PinnedContent {...this.props} />
    );
  }
}
