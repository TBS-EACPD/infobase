import _ from "lodash";
import React from "react";
import { InView } from "react-intersection-observer";
import "intersection-observer";
import ReactResizeDetector from "react-resize-detector/build/withPolyfill";

import { create_text_maker } from "src/models/text";

import { backgroundColor } from "src/core/color_defs";
import { has_local_storage } from "src/core/feature_detection";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconPin, IconUnpin } from "src/icons/icons";

import text from "./PinnedContent.yaml";

const text_maker = create_text_maker(text);

<<<<<<< HEAD:client/src/components/PinnedContent/PinnedContent.js
export const get_pinned_content_local_storage = (local_storage_name) => {
  try {
    return has_local_storage && local_storage_name
      ? JSON.parse(localStorage.getItem(local_storage_name))
      : null;
=======
export const get_pinned_content_local_storage = (
  local_storage_name: string
) => {
  try {
    if (has_local_storage) {
      const storedString = localStorage.getItem(local_storage_name);
      if (storedString !== null) {
        return JSON.parse(storedString);
      }
    } else {
      return null;
    }
>>>>>>> 8177f7d82... prettier formatting:client/src/components/PinnedContent/PinnedContent.tsx
  } catch {
    return null;
  }
};
<<<<<<< HEAD:client/src/components/PinnedContent/PinnedContent.js
export const set_pinned_content_local_storage = (local_storage_name, value) => {
=======
export const set_pinned_content_local_storage = (
  local_storage_name: string,
  value: boolean
) => {
>>>>>>> 8177f7d82... prettier formatting:client/src/components/PinnedContent/PinnedContent.tsx
  has_local_storage &&
    local_storage_name &&
    localStorage.setItem(local_storage_name, value);
};

<<<<<<< HEAD:client/src/components/PinnedContent/PinnedContent.js
class _PinnedContent extends React.Component {
  constructor(props) {
=======
interface PinnedContentProps {
  children?: React.ReactNode;
  default_pin_state?: boolean;
  height_update_delay?: number;
  local_storage_name?: string;
}

interface PinnedContentState {
  is_pinned_local_storage_mirror: boolean | null;
  content_height?: string | number;
}
class _PinnedContent extends React.Component<
  PinnedContentProps,
  PinnedContentState
> {
  content_ref: React.RefObject<HTMLDivElement>;
  constructor(props: PinnedContentProps) {
>>>>>>> 8177f7d82... prettier formatting:client/src/components/PinnedContent/PinnedContent.tsx
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
<<<<<<< HEAD:client/src/components/PinnedContent/PinnedContent.js
  set_is_pinned = (is_pinned) => {
    set_pinned_content_local_storage(this.props.local_storage_name, is_pinned);
=======
  set_is_pinned = (is_pinned: boolean) => {
    if (this.props.local_storage_name) {
      set_pinned_content_local_storage(
        this.props.local_storage_name,
        is_pinned
      );
    }
>>>>>>> 8177f7d82... prettier formatting:client/src/components/PinnedContent/PinnedContent.tsx
    this.setState({ is_pinned_local_storage_mirror: is_pinned });
  };

  pin_pressed = () => {
    this.set_is_pinned(!this.is_pinned);

    this.setState({
      content_height: 0,
    });
  };

  handleKeyDown = (e) => {
    if (e.key === "Tab") {
      this.set_is_pinned(false);
    }
  };

  update_content_height = _.debounce(
    () =>
      this.setState({
<<<<<<< HEAD:client/src/components/PinnedContent/PinnedContent.js
        content_height: this.content_ref.current.clientHeight,
=======
        content_height: this.content_ref.current?.clientHeight,
>>>>>>> 8177f7d82... prettier formatting:client/src/components/PinnedContent/PinnedContent.tsx
      }),
    this.props.height_update_delay
  );

  componentDidMount() {
<<<<<<< HEAD:client/src/components/PinnedContent/PinnedContent.js
    this.set_is_pinned(this.is_pinned);
=======
    if (this.is_pinned) {
      this.set_is_pinned(this.is_pinned);
    }
>>>>>>> 8177f7d82... prettier formatting:client/src/components/PinnedContent/PinnedContent.tsx
    this.update_content_height();
  }

  componentWillUnmount() {
    this.update_content_height.cancel();
  }

  render() {
    const { content_height } = this.state;
    const { children } = this.props;

    return (
      <ReactResizeDetector handleWidth>
        {({ width }) => (
          <InView>
            {({ inView, ref, entry }) => {
              const should_pin =
                this.is_pinned &&
                !inView &&
                entry &&
                entry.boundingClientRect.top < 0;

              return (
                <div ref={ref}>
                  {/* 
                    this conditional div with height height: content_height acts as a placeholder to make scrolling
                    smoother. Before adding this, stickying by "position: fixed" would take it out of the DOM block
                    flow which would bump up the window due to the total block content being shortened.
                    By adding this placeholder div, the height of the total block content remains the same,
                    thus no longer causing the window to jump
                  */}
                  {should_pin && <div style={{ height: content_height }} />}
                  {/* this div is for sticky styline, must be flex to include margins onto height */}
                  <div
                    style={{
                      display: "flex",
                      ...(should_pin && {
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
                </div>
              );
            }}
          </InView>
        )}
      </ReactResizeDetector>
    );
  }
<<<<<<< HEAD:client/src/components/PinnedContent/PinnedContent.js
=======
  static defaultProps = {
    height_update_delay: 1000,
    default_pin_state: has_local_storage,
  };
>>>>>>> 8177f7d82... prettier formatting:client/src/components/PinnedContent/PinnedContent.tsx
}
_PinnedContent.defaultProps = {
  height_update_delay: 1000,
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
