import _ from "lodash";
import React from "react";
import { InView } from "react-intersection-observer";
import ReactResizeDetector from "react-resize-detector";

import { create_text_maker } from "src/models/text";

import { has_local_storage } from "src/core/feature_detection";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconPin, IconUnpin } from "src/icons/icons";
import { backgroundColor } from "src/style_constants/index";

export {NonA11yPinnedContent}


import text from "./PinnedContent.yaml";

const text_maker = create_text_maker(text);

type NonA11yPinnedContentProps = {
  local_storage_name: string,
  default_pin_state: string,
}

interface isPinnedMirrorHelper {
  is_pinned_local_storage_mirror: string | boolean | null,
}

export const get_pinned_content_local_storage = (local_storage_name: string) => {
  try {
    return has_local_storage && local_storage_name 
      ? (JSON.parse(localStorage.getItem(local_storage_name) || '{}'))
      : null;
  } catch {
    return null;
  }
};
export const set_pinned_content_local_storage = (local_storage_name: string, value: string) => {
  has_local_storage &&
    local_storage_name &&
    localStorage.setItem(local_storage_name, value);
};

const get_is_pinned = (
  local_storage_name: string,
  default_pin_state: string,
  is_pinned_local_storage_mirror = null
) => {
  if (has_local_storage && local_storage_name) {
    const is_pinned: boolean = get_pinned_content_local_storage(local_storage_name);
    return _.isBoolean(is_pinned) ? is_pinned : default_pin_state;
  } else {
    return _.isBoolean(is_pinned_local_storage_mirror)
      ? is_pinned_local_storage_mirror
      : default_pin_state;
  }
};


class NonA11yPinnedContent extends React.Component<NonA11yPinnedContentProps,isPinnedMirrorHelper> {
  placeHolderRef = React.createRef<HTMLDivElement>();
  contentRef = React.createRef<HTMLDivElement>();
  static defaultProps: { default_pin_state: boolean; };
 
  constructor(props: NonA11yPinnedContentProps) {
    super(props);

    this.state = {
      is_pinned_local_storage_mirror: get_is_pinned(
        props.local_storage_name,
        props.default_pin_state
      ),
    };
  }

  get is_pinned() {
    const { local_storage_name, default_pin_state } = this.props;
    const { is_pinned_local_storage_mirror } = this.state;

    return get_is_pinned(
      local_storage_name,
      default_pin_state,
      null,
    );
  }

  set_is_pinned = (is_pinned: boolean) => {
    set_pinned_content_local_storage(this.props.local_storage_name, is_pinned.toString());
    this.setState({ is_pinned_local_storage_mirror: is_pinned });
  };
  click_pin = () => {
    this.set_is_pinned(!this.is_pinned);
  };
  tab_over_pin = (e: React.KeyboardEvent) => {
    // keyboard pin presses generally handeled by the onClick, since it's a button; special case where we make tabbing through the pin button
    // specifically disable pinning. Otherwise, the pinned content drawer will follow the screen down and likely cover whatever next takes tab focus
    if (e.key === "Tab") {
      this.set_is_pinned(false);
    }
  };

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
              {/* height resize dectector to sync the height of the content with the height of a placeholder div used,
              when the content is floating, to prevent the page content from shifting when the content catches/uncatches 
              on the initial location */}
              <ReactResizeDetector handleHeight refreshMode="throttle">
                {({ targetRef: contentRef }) => (
                  /* width resize dectector to sync the content's width with the width given to it's original rendering context
                  (grabbed from the placeholder), so that it stays consistent when transitioning to a fixed position*/
                  <ReactResizeDetector handleWidth refreshMode="throttle">
                    {({ targetRef: placeHolderRef }) => (
                      <>
                        <div
                          ref={this.placeHolderRef}
                          style={{
                            width: "100%",
                            height: should_pin
                              ? this.contentRef.current?.offsetHeight
                              : "0px",
                          }}
                        />
                        <div
                          ref={this.contentRef}
                          style={{
                            width: this.placeHolderRef.current?.offsetWidth,
                            ...(should_pin && {
                              position: "fixed",
                              top: 0,
                              zIndex: 2002,
                            }),
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
                                onClick={this.click_pin}
                                onKeyDown={this.tab_over_pin}
                                style={{
                                  background: "none",
                                  border: "none",
                                }}
                                aria-label={text_maker(
                                  !this.is_pinned ? "pin" : "unpin"
                                )}
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
                )}
              </ReactResizeDetector>
            </div>
          );
        }}
      </InView>
    );
  }
}
NonA11yPinnedContent.defaultProps = {
  default_pin_state: has_local_storage,
};

export class PinnedContent extends React.Component {
  render() {
    return is_a11y_mode ? (
      this.props.children
    ) : (
      <NonA11yPinnedContent local_storage_name={""} {...this.props} />
    );
  }
}

