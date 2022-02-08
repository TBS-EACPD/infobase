import React from "react";

import { is_dev_link } from "src/core/injected_build_constants";

export class DevFip extends React.Component {
  componentDidMount() {
    if (is_dev_link) {
      const div = document.createElement("div");
      div.style.backgroundColor = "red";
      const h1 = document.createElement("H1");
      h1.style.textAlign = "center";
      h1.style.marginTop = "0px";
      h1.style.marginBottom = "0px";
      h1.style.fontWeight = "400";
      h1.style.color = "black";
      const text = document.createTextNode("Development version");
      h1.append(text);
      div.append(h1);
      (<HTMLObjectElement>(
        document.getElementById("ib-site-header-area")
      )).prepend(div);
    }
  }
  render() {
    return null;
  }
}
