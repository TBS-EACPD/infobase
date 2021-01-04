import React from "react";

import _ from "src/app_bootstrap/lodash_mixins.js";

export class IconArray extends React.Component {
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
