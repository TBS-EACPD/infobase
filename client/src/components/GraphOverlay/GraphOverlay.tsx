import React, { Fragment } from "react";

import { connect } from "react-redux";

import MediaQuery from "react-responsive";

import { create_text_maker_component } from "src/components/misc_util_components";

import { IconRotatePhone, IconExpandWindowWidth } from "src/icons/icons";

import { hide_graph_overlay } from "src/InfoBase/AppState";

import text from "./GraphOverlay.yaml";

import "./GraphOverlay.scss";

//import { MouseEventHandler } from "@nivo/pie";

//import { App } from "src/InfoBase/App";

//import { lang } from "src/core/injected_build_constants";

const { TM, text_maker } = create_text_maker_component(text);

interface GraphOverlayProps {
  is_showing_graph_overlay: boolean,
  hide_graph_overlay: React.MouseEventHandler<HTMLButtonElement>,
}

class _GraphOverlay extends React.Component<GraphOverlayProps> {
  render() {
    const { children, is_showing_graph_overlay, hide_graph_overlay } =
      this.props;

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


const mapStateToProps = (state: { app: { is_showing_graph_overlay: boolean; }; }) => ({
  is_showing_graph_overlay: state.app.is_showing_graph_overlay,
});

const mapDispatchToProps = (dispatch: (arg0: { type: string; }) => Record<string,unknown>) => ({
  hide_graph_overlay: () => dispatch(hide_graph_overlay()),
});

export const GraphOverlay = connect(
  mapStateToProps,
  mapDispatchToProps
)(_GraphOverlay);

