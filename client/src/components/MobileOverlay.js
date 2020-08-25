import MediaQuery from "react-responsive";
import "./MobileOverlay.scss";

export default class MobileOverlay extends React.Component {
  render() {
    return (
      <MediaQuery maxDeviceWidth={600}>
        <div className="overlay"></div>
      </MediaQuery>
    );
  }
}
