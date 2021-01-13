import _ from "lodash";
import React from "react";


import { trivial_text_maker } from "../models/text.js";
import "./HeaderNotification.scss";

export class HeaderNotification extends React.Component {
  state = {
    show: false,
  };

  componentDidMount() {
    setTimeout(() => this.setState({ show: true }), 500);
  }

  render() {
    const { list_of_text, hideNotification } = this.props;

    return (
      <div
        style={{
          transform: !this.state.show ? "translateY(-100%)" : "translateY(0)",
        }}
        className="ib-header alert-warning"
      >
        {_.map(list_of_text, (text, i) => (
          <p key={i} style={{ marginBottom: "1.2rem" }}>
            {text}
          </p>
        ))}
        <button className="btn btn-ib-primary" onClick={hideNotification}>
          {trivial_text_maker("close")}
        </button>
      </div>
    );
  }
}
