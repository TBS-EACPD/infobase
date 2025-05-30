import _ from "lodash";
import React, { Fragment } from "react";

import "./IconGrid.scss";

interface ImageIconProps {
  alt: string;
  href: string;
  src: string;
}

interface SVGIconProps {
  svg: React.ReactNode;
}

interface IconGridProps {
  icons: (ImageIconProps | SVGIconProps)[];
}

export class IconGrid extends React.Component<IconGridProps> {
  render() {
    const { icons } = this.props;
    return (
      <div aria-hidden="true" className="icon-block">
        {_.map(icons, (icon, ix) =>
          "href" in icon ? (
            <a href={icon.href} key={icon.src}>
              <img alt={icon.alt} src={icon.src} />
            </a>
          ) : (
            <Fragment key={ix}>{icon.svg}</Fragment>
          )
        )}
      </div>
    );
  }
}
