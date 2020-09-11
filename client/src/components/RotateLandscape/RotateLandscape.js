import { Fragment } from "react";
import { connect } from "react-redux";
import MediaQuery from "react-responsive";

import "./RotateLandscape.scss";
import { IconRotatePhone, IconExpandWindowWidth } from "../../icons/icons.js";

import { rotate_landscape_off } from "../../InfoBase/AppState.js";
import { create_text_maker_component } from "../misc_util_components";

import text from "./RotateLandscape.yaml";

const { TM, text_maker } = create_text_maker_component(text);

class LandscapeOverlay extends React.Component {
  render() {
    const { children, rotate_landscape, rotate_landscape_off } = this.props;

    return (
      <div style={{ position: "relative" }}>
        {children}
        {rotate_landscape ? (
          <Fragment>
            <MediaQuery maxDeviceWidth={567.98} orientation="portrait">
              <div className="overlay">
                <TM k="rotate_text" el="h2" style={{ color: "white" }} />
                <IconRotatePhone width="50%" />
                <button
                  className="btn btn-ib-primary"
                  onClick={rotate_landscape_off}
                >
                  {text_maker("show_anyway")}
                </button>
              </div>
            </MediaQuery>
            <MediaQuery minDeviceWidth={568} maxWidth={567.98}>
              <div className="overlay">
                <TM k="expand_width_text" el="h2" style={{ color: "white" }} />
                <IconExpandWindowWidth width="50%" />
                <button
                  className="btn btn-ib-primary"
                  onClick={rotate_landscape_off}
                >
                  {text_maker("show_anyway")}
                </button>
              </div>
            </MediaQuery>
          </Fragment>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rotate_landscape: state.show_rotate_landscape,
});

const mapDispatchToProps = (dispatch) => ({
  rotate_landscape_off: () => dispatch(rotate_landscape_off()),
});

export const RotateLandscape = connect(
  mapStateToProps,
  mapDispatchToProps
)(LandscapeOverlay);
