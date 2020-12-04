import React from "react";

import "./IconGrid.scss";

export class IconGrid extends React.Component {
  render() {
    const { icons } = this.props;
    return (
      <div aria-hidden="true" className="icon-block">
        {_.map(icons, (icon) =>
          icon.href ? (
            <a href={icon.href} key={icon.src}>
              <img src={icon.src} key={icon.src} />
            </a>
          ) : (
            <img className="svg-inline" src={icon.src} key={icon.src} />
          )
        )}
      </div>
    );
  }
}
