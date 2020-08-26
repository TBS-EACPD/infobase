import MediaQuery, { useMediaQuery } from "react-responsive";
import "./RotateLandscape.scss";
import text from "./RotateLandscape.yaml";
import RotateIcon from "./RotateLandscape.svg";
import { create_text_maker_component } from "../misc_util_components";
import { Fragment } from "react";

const { TM } = create_text_maker_component(text);

export default class RotateLandscape extends React.Component {
  render() {
    const { rotate_landscape, children } = this.props;

    return rotate_landscape ? (
      <Fragment>
        <MediaQuery maxDeviceWidth={567.98}>
          <MediaQuery orientation="portrait">
            <div className="overlay">
              <TM k="rotate_text" el="h2" style={{ color: "white" }} />
              <div
                className="icon"
                dangerouslySetInnerHTML={{ __html: RotateIcon }}
              />
            </div>
          </MediaQuery>
          <MediaQuery orientation="landscape">{children}</MediaQuery>
        </MediaQuery>
        <MediaQuery minDeviceWidth={568}>{children}</MediaQuery>
      </Fragment>
    ) : (
      children
    );
  }
}
