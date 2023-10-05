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
    const hidePStyle = {
      display: "none",
    };
    return (
      <div aria-hidden="true" className="icon-block">
        {_.map(icons, (icon, ix) =>
          "href" in icon ? (
            <a href={icon.href} key={icon.src}>
              <img alt={icon.alt} src={icon.src} />
            </a>
          ) : (
            //Extra p is utilized for testing, as a Fragment cannot have
            //a data-testid value.
            <p data-testid={ix} key={ix} style={hidePStyle}>
              <Fragment key={ix}>{icon.svg}</Fragment>
            </p>
          )
        )}
      </div>
    );
  }
}
