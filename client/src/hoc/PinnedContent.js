import classNames from "classnames";
import { InView } from "react-intersection-observer";
import "intersection-observer";
import ReactResizeDetector from "react-resize-detector";

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
        } catch {
          user_enabled_pinning = true;
        }
      }

      this.state = {
        user_enabled_pinning: _.isBoolean(user_enabled_pinning)
          ? user_enabled_pinning
          : true,
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
