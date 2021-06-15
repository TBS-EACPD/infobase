import React from "react";

import { TreeMapControls } from "./TreeMapControls";
import "./TreeMap.scss";

export interface LocationProps {
  hash: string;
  pathname: string;
  search: string;
}

export interface HistoryProps {
  action: string;
  block: Function;
  createHref: Function;
  go: Function;
  goBack: Function;
  goForward: Function;
  length: number;
  listen: Function;
  location: LocationProps;
  push: (arg: string) => void;
  replace: Function;
}
export interface TreeMapSidebarProps {
  perspective: string;
  color_var: string;
  year: string;
  filter_var: string;
  get_changes?: string;
  location?: LocationProps;
  history?: HistoryProps;
}
export class TreeMapSidebar extends React.Component<TreeMapSidebarProps> {
  constructor(props: TreeMapSidebarProps) {
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
