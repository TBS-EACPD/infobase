import React from "react";

import { TreeMapControls } from "./TreeMapControls";
import "./TreeMap.scss";

interface LocationProps {
  hash: string;
  pathname: string;
  search: string;
}
interface TreeMapSideBarProps {
  perspective: string;
  color_var: string;
  year: string;
  filter_var: string;
  get_changes: string;
  location: LocationProps;
  history: {
    action: string;
    block: Function;
    createHref: Function;
    go: Function;
    goBack: Function;
    goForward: Function;
    length: number;
    listen: Function;
    location: LocationProps;
    push: Function;
    replace: Function;
  };
}
export class TreeMapSidebar extends React.Component<TreeMapSideBarProps> {
  constructor(props: TreeMapSideBarProps) {
    super(props);
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
