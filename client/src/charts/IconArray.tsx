import _ from "lodash";
import React from "react";

interface IconArrayItem {
  [key: string]: any;
}

interface IconArrayProps {
  render_item: Function;
  items: IconArrayItem[];
  heightFirst?: boolean;
}

export class IconArray extends React.Component<IconArrayProps> {
  render() {
    const { render_item, items, heightFirst } = this.props;

    const rendered_items = _.map(items, (item, ix) => (
      <div
        key={ix}
        style={{
          flex: "0 0 auto",
        }}
      >
        {render_item(item)}
      </div>
    ));

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          alignContent: "flex-start",
          flexWrap: "wrap",
          flexDirection: heightFirst ? "column" : "row",
        }}
      >
        {rendered_items}
      </div>
    );
  }
}
