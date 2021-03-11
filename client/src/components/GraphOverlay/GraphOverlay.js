import React, { Fragment } from "react";
import { connect } from "react-redux";
import MediaQuery from "react-responsive";

import { create_text_maker_component } from "src/components/misc_util_components.js";

import { IconRotatePhone, IconExpandWindowWidth } from "src/icons/icons.js";

import { hide_graph_overlay } from "src/InfoBase/AppState.js";

import text from "./GraphOverlay.yaml";
import "./GraphOverlay.scss";

const { TM, text_maker } = create_text_maker_component(text);

class _GraphOverlay extends React.Component {
  render() {
    const {
      children,
      is_showing_graph_overlay,
      hide_graph_overlay,
    } = this.props;

    return (
      <div style={{ position: "relative" }}>
        {children}
        {is_showing_graph_overlay && (
          <Fragment>
            <MediaQuery maxDeviceWidth={567.98} orientation="portrait">
              <div className="overlay">
                <TM k="rotate_text" el="h2" style={{ color: "white" }} />
                <IconRotatePhone width="50%" />
                <button
                  className="btn btn-ib-primary"
                  onClick={hide_graph_overlay}
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
                  onClick={hide_graph_overlay}
                >
                  {text_maker("show_anyway")}
                </button>
              </div>
            </MediaQuery>
          </Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  is_showing_graph_overlay: state.is_showing_graph_overlay,
});

const mapDispatchToProps = (dispatch) => ({
  hide_graph_overlay: () => dispatch(hide_graph_overlay()),
});

export const GraphOverlay = connect(
  mapStateToProps,
  mapDispatchToProps
)(_GraphOverlay);
