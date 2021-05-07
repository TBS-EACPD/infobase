import React from "react";

import { is_dev_link } from "src/core/injected_build_constants.ts";

export class DevFip extends React.Component {
  componentDidMount() {
    if (is_dev_link) {
      (<HTMLObjectElement>document.querySelector(".canada-logo")).setAttribute(
        "data",
        "./svg/infobase-dev-fip.svg"
      );
      (<HTMLDivElement>(
        document.querySelector("#ib-site-header")
      )).style.backgroundColor = "red";
    }
  }
  render() {
    return null;
  }
}
