import React from "react";

import { TreeMapControls } from "./TreeMapControls.js";
import "./TreeMap.scss";

export class TreeMapSidebar extends React.Component {
  constructor() {
    super();
  }
  render() {
    const {
      perspective,
      color_var,
      year,
      filter_var,
      get_changes,
      location,
      history,
    } = this.props;
    return (
      <div>
        <div className="TreeMap_SideBar__Text">
          <TreeMapControls
            perspective={perspective}
            color_var={color_var}
            year={year}
            filter_var={filter_var}
            get_changes={get_changes}
            location={location}
            history={history}
          />
        </div>
      </div>
    );
  }
}
