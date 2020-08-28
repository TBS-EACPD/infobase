import MediaQuery from "react-responsive";
import "./RotateLandscape.scss";
import text from "./RotateLandscape.yaml";
import svgs from "./RotateLandscapeSVG.yaml";
import { create_text_maker_component } from "../misc_util_components";
import { Fragment } from "react";

const { TM } = create_text_maker_component(text);

export default class RotateLandscape extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div style={{ position: "relative" }}>
        {children}
        <MediaQuery maxDeviceWidth={567.98} orientation="portrait">
          <div className="overlay">
            <TM k="rotate_text" el="h2" style={{ color: "white" }} />
            <div
              className="icon"
              dangerouslySetInnerHTML={{ __html: svgs.rotate_icon }}
            />
          </div>
        </MediaQuery>
        <MediaQuery minDeviceWidth={568} maxWidth={567.98}>
          <div className="overlay">
            <TM k="expand_width_text" el="h2" style={{ color: "white" }} />
            <div
              className="icon"
              dangerouslySetInnerHTML={{ __html: svgs.expand_width_icon }}
            />
          </div>
        </MediaQuery>
      </div>
    );
  }
}
