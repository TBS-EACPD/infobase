import classNames from "classnames";
import { InView } from "react-intersection-observer";
import "intersection-observer";
import ReactResizeDetector from "react-resize-detector";

import { IconPin, IconUnpin } from "../icons/icons.js";

import { has_local_storage } from "src/core/feature_detection.js";

export const PinnedContent = (WrappedComponent, local_storage_name) =>
  class Pinned extends React.Component {
    constructor(props) {
      super(props);

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

      this.state = {
        user_enabled_pinning: user_enabled_pinning,
      };
    }

    componentDidUpdate(prev_props, prev_state) {
      localStorage.setItem(
        local_storage_name,
        !prev_state.user_enabled_pinning
      );
    }

    pin_pressed = () => {
      const { user_enabled_pinning } = this.state;
      this.setState({
        user_enabled_pinning: !user_enabled_pinning,
      });
    };

    render() {
      const { user_enabled_pinning } = this.state;

      return (
        <ReactResizeDetector handleWidth>
          {({ width }) => (
            <InView>
              {({ inView, ref, entry }) => (
                // this div is for the intersection check
                <div style={{ position: "relative" }} ref={ref}>
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
                    <div
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                      }}
                    >
                      <button
                        style={{
                          background: "none",
                          border: "none",
                        }}
                        onClick={this.pin_pressed}
                      >
                        {user_enabled_pinning ? (
                          <IconPin
                            height="25px"
                            width="25px"
                            vertical_align="top"
                            alternate_color="false"
                          />
                        ) : (
                          <IconUnpin
                            height="25px"
                            width="25px"
                            vertical_align="top"
                            alternate_color="false"
                          />
                        )}
                      </button>
                    </div>
                    <WrappedComponent {...this.props} />
                  </div>
                </div>
              )}
            </InView>
          )}
        </ReactResizeDetector>
      );
    }
  };
