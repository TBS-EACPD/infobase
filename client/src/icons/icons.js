import classNames from "classnames";
import React, { Fragment } from "react";

import { textColor, tertiaryColor } from "src/core/color_defs.js";

import _ from "lodash";

import "./icons.scss";

const svg_default_styles = {
  width: "1.5em",
  height: "1.5em",
  verticalAlign: "-0.5em",
};
const inline_svg_default_styles = {
  width: "1.2em",
  height: "1.2em",
  verticalAlign: "-0.2em",
};
class _IconWrapper extends React.Component {
  constructor() {
    super();
    this.state = { icon_instance_id: _.uniqueId("icon-svg-instance-") };
  }
  render() {
    const {
      // icon component API props
      color,
      alternate_color,
      rotation,
      title,
      width,
      height, // if falsey will assume square using width
      vertical_align,
      inline,
      aria_hide, // for icons that are displayed next to text that repeats what the icon represents

      // internal props
      ChildSVG,
      viewbox_width, // the original coordinate system the svg was created in
      viewbox_height, // if falsey will assume square using viewbox_width
    } = this.props;

    const { icon_instance_id } = this.state;

    const svg_styles = {
      ...(!inline && svg_default_styles),
      ...(inline && inline_svg_default_styles),
      ..._.pickBy({
        width,
        height: height || width,
        verticalAlign: vertical_align,
      }),
    };

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        className={classNames("icon-svg", inline && "icon-svg--inline")}
        style={svg_styles}
        viewBox={`0 0 ${viewbox_width} ${viewbox_height || viewbox_width}`}
        aria-hidden={aria_hide}
      >
        <title>{title}</title>
        {alternate_color && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
              #${icon_instance_id} {
                fill: ${color};
                stroke: ${color};
              }
              *:hover > svg > #${icon_instance_id}, 
              *:focus > svg > #${icon_instance_id},
              *:active > svg > #${icon_instance_id} {
                fill: ${alternate_color};
                stroke: ${alternate_color};
              }
            `,
            }}
          />
        )}
        <g
          id={icon_instance_id}
          style={!alternate_color ? { fill: color, stroke: color } : {}}
          transform={rotation ? `rotate(${rotation} 250 250)` : ""}
        >
          <ChildSVG />
        </g>
      </svg>
    );
  }
}
_IconWrapper.defaultProps = {
  color: textColor,
  alternate_color: tertiaryColor,
  inline: false,
  aria_hide: false,

  viewbox_width: 24,
};

const IconHome = (props) => {
  const SVGHome = () => (
    <Fragment>
      <path
        className={"icon-fill"}
        d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGHome} />;
};

const IconFeedback = (props) => {
  const SVGFeedback = () => {
    return (
      <path
        className="icon-stroke"
        strokeWidth="2"
        strokeMiterlimit="1"
        d="M21.8,19.2c0.1,0-0.3-0.5-0.4-0.7l-1.7-2.7c0.8-0.7,2.2-2.7,2.1-4.5c-0.2-4-4.5-7.3-10-7.3s-10,3.3-10,7.3
        s4.5,7.3,10,7.3c1.8,0,3.3-0.2,4.7-0.8C20.6,19,21.2,19.3,21.8,19.2z"
      />
    );
  };

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGFeedback} />;
};

const IconAbout = (props) => {
  const SVGAbout = () => {
    return (
      <Fragment>
        <path
          className="icon-stroke"
          d="M12,2.8c5.1,0,9.2,4.1,9.2,9.2s-4.1,9.2-9.2,9.2c-5.1,0-9.2-4.1-9.2-9.2c0-3.7,2.2-7,5.6-8.5
          C9.5,3,10.8,2.8,12,2.8 M12,1.8C6.4,1.8,1.8,6.4,1.8,12S6.4,22.2,12,22.2S22.2,17.6,22.2,12S17.6,1.8,12,1.8z"
        />
        <path
          className="icon-fill"
          d="M14.6,16.7c-0.9,1.9-2.2,2.8-2.9,2.9c-0.7,0.1-1-0.5-1-2.2c0.1-2,0.1-3.3,0.2-5.1c0-0.7,0-1-0.3-0.9
          c-0.3,0.1-0.7,0.6-1.1,1.1l-0.3-0.3c0.8-1.4,2.1-2.7,3-2.9c0.8-0.2,0.9,0.5,0.9,2.5c-0.1,1.6-0.1,3.3-0.2,4.9c0,0.6,0.1,0.8,0.3,0.8
          c0.2,0,0.5-0.3,1-1.1L14.6,16.7z M13,5.8c0.1,0.7-0.2,1.5-0.9,1.7c-0.6,0.1-1.1-0.2-1.2-0.9c-0.1-0.6,0.2-1.5,1-1.7
          C12.4,4.7,12.8,5.2,13,5.8z"
        />
      </Fragment>
    );
  };

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGAbout} />;
};

const IconGlossary = (props) => {
  const SVGGlossary = () => {
    return (
      <Fragment>
        <g>
          <path
            className="icon-stroke"
            d="M5.5,2.3h12.9c0.7,0,1.4,0.6,1.4,1.4v16.7c0,0.7-0.6,1.4-1.4,1.4H5.5c-0.7,0-1.4-0.6-1.4-1.4V3.6
            C4.2,2.9,4.8,2.3,5.5,2.3z"
          />
          <line className="icon-stroke" x1="6.7" y1="2.5" x2="6.7" y2="21.7" />
        </g>
        <path
          className="icon-fill icon-stroke"
          d="M12.1,18.6c0-0.1,0-0.2,0.1-0.2l4.2-5v0h-3.6c-0.2,0-0.4-0.2-0.4-0.3l0,0c0-0.2,0.2-0.3,0.4-0.3h4.5
          c0.2,0,0.4,0.2,0.4,0.3v0c0,0.1,0,0.2-0.1,0.2l-4.2,5v0h4c0.2,0,0.4,0.2,0.4,0.3l0,0c0,0.2-0.2,0.3-0.4,0.3h-4.9
          C12.3,19,12.1,18.8,12.1,18.6L12.1,18.6z"
        />
        <path
          className="icon-fill icon-stroke"
          d="M10.3,10.1l-0.6,1.6C9.6,11.9,9.5,12,9.3,12H9.1c-0.2,0-0.4-0.2-0.4-0.4c0,0,0-0.1,0-0.1l2.3-6
          c0.1-0.2,0.2-0.3,0.4-0.3h0.7c0.2,0,0.3,0.1,0.4,0.3l2.3,6c0.1,0.2,0,0.4-0.2,0.5c0,0-0.1,0-0.1,0h-0.2c-0.2,0-0.3-0.1-0.4-0.3
          l-0.6-1.6C13.2,10,13,9.9,12.9,9.9h-2.2C10.5,9.9,10.4,10,10.3,10.1z M12.4,9.2c0.2,0,0.4-0.2,0.4-0.4c0,0,0-0.1,0-0.1l-0.5-1.4
          C12,6.8,11.9,6.4,11.8,6h0c-0.1,0.4-0.2,0.8-0.4,1.2l-0.5,1.4c-0.1,0.2,0,0.4,0.2,0.5c0,0,0.1,0,0.1,0H12.4z"
        />
      </Fragment>
    );
  };

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGGlossary} />;
};

const IconDataset = (props) => {
  const SVGDataset = () => {
    return (
      <Fragment>
        <path
          className="icon-stroke"
          strokeWidth="50"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M116.5,98.5h367
          c6.6,0,12,5.4,12,12v394c0,6.6-5.4,12-12,12h-367c-6.6,0-12-5.4-12-12v-394C104.5,103.9,109.9,98.5,116.5,98.5z"
        />
        <line
          className="icon-stroke"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="104.5"
          y1="190.5"
          x2="494.5"
          y2="190.5"
        />
        <line
          className="icon-stroke"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="104.5"
          y1="272.5"
          x2="495.5"
          y2="272.5"
        />
        <line
          className="icon-stroke"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="104.5"
          y1="354.5"
          x2="495.5"
          y2="354.5"
        />
        <line
          className="icon-stroke"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="104.5"
          y1="434.5"
          x2="495.5"
          y2="434.5"
        />
        <line
          className="icon-stroke"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="234.5"
          y1="197.5"
          x2="234.5"
          y2="515.5"
        />
        <line
          className="icon-stroke"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
          x1="365.5"
          y1="194.5"
          x2="365.5"
          y2="515.5"
        />
      </Fragment>
    );
  };

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGDataset} />;
};

const IconShare = (props) => {
  const SVGShare = () => (
    <path
      className="icon-fill"
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34
      3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65
      0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
    />
  );

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGShare} />;
};

const IconPermalink = (props) => {
  const SVGPermalink = () => {
    return (
      <g className="icon-fill">
        {/* 
        Copyright Wikimedia
        
        Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
        to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
        and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
        
        The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
        fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other
        liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings
        in the Software.
        */}
        <path d="M20.437 2.69c-3.37 0-5.778 3.05-8.186 5.297.322 0 .804-.16 1.285-.16.803 0 1.605.16 2.408.48 1.284-1.283 2.568-2.727 4.494-2.727.963 0 2.087.48 2.89 1.123 1.605 1.605 1.605 4.174 0 5.78l-4.174 4.172c-.642.642-1.926 1.124-2.89 1.124-2.246 0-3.37-1.446-4.172-3.212l-2.086 2.087c1.284 2.408 3.21 4.173 6.1 4.173 1.926 0 3.69-.802 4.815-2.086l4.172-4.174c1.445-1.444 2.408-3.21 2.408-5.297-.32-3.53-3.53-6.58-7.063-6.58z" />
        <path d="M13.535 22.113l-1.444 1.444c-.64.642-1.925 1.124-2.89 1.124-.962 0-2.085-.48-2.888-1.123-1.605-1.605-1.605-4.334 0-5.778l4.174-4.175c.642-.642 1.926-1.123 2.89-1.123 2.246 0 3.37 1.605 4.172 3.21l2.087-2.087c-1.284-2.407-3.21-4.173-6.1-4.173-1.926 0-3.692.803-4.815 2.087L4.547 15.69c-2.73 2.73-2.73 7.063 0 9.63 2.568 2.57 7.062 2.73 9.47 0l3.05-3.05c-.482.162-.963.162-1.445.162-.803 0-1.445 0-2.087-.32z" />
      </g>
    );
  };

  return <_IconWrapper {...props} viewbox_width={30} ChildSVG={SVGPermalink} />;
};

const IconDownload = (props) => {
  const SVGDownload = () => (
    <path className="icon-fill" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  );

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGDownload} />;
};

const IconChevron = (props) => {
  const SVGChevron = ({ rotation }) => {
    return (
      <polygon
        transform={rotation && `rotate(${rotation} 250 250)`}
        className="icon-fill"
        points="469.7,189.8 377.9,103.2 377.9,103.2 250.1,223.8 122.1,103.1 30.3,189.7 249.8,396.8 249.9,396.7 
        250.2,396.9 "
      />
    );
  };

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGChevron} />;
};

const IconZoomIn = (props) => {
  const SVGZoomIn = () => (
    <Fragment>
      <path
        className="icon-fill"
        d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
      <path className="icon-fill" d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGZoomIn} />;
};

const IconZoomOut = (props) => {
  const SVGZoomOut = () => (
    <Fragment>
      <path
        className="icon-fill"
        d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGZoomOut} />;
};

const IconFilterColumns = (props) => {
  const SVGFilterColumns = () => (
    <Fragment>
      <path
        className="icon-fill"
        d="M11 18h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1zm4 6h10c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1z"
      />
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGFilterColumns} />
  );
};

const IconCheckmark = (props) => {
  const SVGCheckmark = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998
          36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997
          26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.2079.997-36.204-.001z"
        />
      </Fragment>
    );
  };

  return (
    <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGCheckmark} />
  );
};

const IconCheck = (props) => {
  const SVGCheck = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8s-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250
          c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
          S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"
        />
        <path
          className="icon-fill"
          d="M234.9,354.7l127.9-186.2c3.7-5.5,3-13.1-1.6-17.1L347,139.2c-1.7-1.5-3.9-2.3-6.1-2.3l0,0
          c-3.7,0.1-7.1,2-9.1,5.1L218.5,307l-57.7-48.5c-1.9-1.7-4.2-2.6-6.7-2.8l0,0c-1.8-0.1-3.5,0.8-4.6,2.2l-13.9,20.7
          c-2.1,3.2-0.5,8.6,3.6,12l80.9,68.1c1.9,1.7,4.2,2.6,6.7,2.8c1.8,0.1,3.5-0.8,4.6-2.2"
        />
      </Fragment>
    );
  };

  return <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGCheck} />;
};

const IconAttention = (props) => {
  const SVGAttention = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8c0,100.4-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250
          c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
          S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"
        />
        <g>
          <path
            className="icon-fill"
            d="M276.6,126.3L276.6,126.3l-53.1,0c-5.8,0-10.3,9-9.6,19.2l9.5,147.8c0.6,8.7,4.7,15.3,9.6,15.3h32.2
            c4.8,0,8.9-6.4,9.6-14.9l11.5-147.8C286.9,135.5,282.4,126.3,276.6,126.3z"
          />
          <path
            className="icon-fill"
            d="M250,326.3c-13.1,0.1-23.6,10.8-23.5,23.9c0.1,13.1,10.8,23.6,23.9,23.5c13-0.1,23.5-10.7,23.5-23.7
            C273.8,336.9,263.1,326.3,250,326.3z"
          />
        </g>
      </Fragment>
    );
  };
  return (
    <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGAttention} />
  );
};

const IconNotApplicable = (props) => {
  const SVGNotApplicable = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M250,68.2c100.4,0,181.8,81.4,181.8,181.8S350.4,431.8,250,431.8S68.3,350.4,68.3,250
          c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
          S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"
        />
        <path
          className="icon-fill"
          d="M168.4,225.5h163.3c4.9,0,8.9,4,8.9,8.9v31.3c0,4.9-4,8.9-8.9,8.9H168.4c-4.9,0-8.9-4-8.9-8.9v-31.3
          C159.5,229.5,163.5,225.5,168.4,225.5z"
        />
      </Fragment>
    );
  };

  return (
    <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGNotApplicable} />
  );
};

const IconClock = (props) => {
  const SVGClock = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8s-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250
          c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
          S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"
        />
        <path
          className="icon-fill"
          d="M226.8,267.3c0.6,1.5,1.8,2.6,2.9,3.8l82.9,82.9c3,3,7.8,3,10.7,0l0,0l15.6-15.6c3-3,3-7.8,0-10.7l0,0
          l-75.5-75.5v-135c0-4.6-3.7-8.3-8.3-8.3l0,0h-20.7c-4.6,0-8.3,3.7-8.3,8.3v147.1c0,0,0,0,0,0.1C226.1,265.2,226.5,266.5,226.8,267.3"
        />
      </Fragment>
    );
  };

  return <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGClock} />;
};

const IconEyeOpen = (props) => {
  const SVGEyeOpen = () => {
    return (
      <path
        className="icon-fill"
        d="M250,125.4 M247.3,125.4c-95.5,1.9-169.7,101.1-172.9,105.4l-6.2,8.4l5.5,8.9c3.2,5.2,79.5,126.4,177,126.4
        c97.6,0,172.5-121.4,175.6-126.5l5.4-8.9l-6.2-8.4c-3.1-4.3-77.4-103.6-173-105.4 M182.1,233.3l70,49.8c-6.8,9.6-28,6.2-47.3-7.5
        C185.5,261.8,175.3,242.9,182.1,233.3z M354.6,288.7c-24.7,25.1-62.8,54.9-103.9,54.9c-41,0-79.3-29.7-104.2-54.6
        c-18.6-18.6-32.8-37.5-40.4-48.2c7.5-8.9,20.9-23.7,38.5-38.5c7.1-6,14-11.2,20.7-15.8c-2.9,8.8-4.5,18.2-4.5,28
        c0,49.2,39.9,89.1,89.1,89.1s89.1-39.9,89.1-89.1c0-9.8-1.6-19.2-4.5-28c27.8,19,49.1,42.3,59.4,54.4
        C386.6,251.5,372.9,270.1,354.6,288.7z"
      />
    );
  };

  return <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGEyeOpen} />;
};

const IconEyeClosed = (props) => {
  const SVGEyeClosed = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M381.9,227.9c4.1,4.3,8,8.7,11.8,13.2c-11.7,17-24.9,33-39.3,47.8c-15,15.2-35,32.2-57.6,43.2l0,0l0,0
          l-18.5,39.5c83.7-19.3,145-118.7,147.8-123.3l5.4-8.9l-6-8.3c-16-20.7-34.4-39.6-54.8-56L357,204.2"
        />
        <path
          className="icon-fill"
          d="M362.7,71.1l-35.3,75.2c-18.1-9.5-38-16.7-59.2-19.4c-12-2.5-24.4-2.5-36.4,0
          C143.9,138.2,77.4,227.1,74.5,231.1l-6.2,8.4l5.5,8.9c2.9,4.6,64.6,103.1,147.9,123l-25.4,54.1l23.9,9.7L386.5,80.9h0.1v-0.1
          L362.7,71.1z M182.1,232.9L182.1,232.9L182.1,232.9l70,49.8c-2.6,3.6-7.1,5.4-12.9,5.4c-9.6,0.1-22.4-4.4-34.5-13
          C185.5,261.5,175.3,242.5,182.1,232.9z M235.2,342.6c-35.1-6.1-67-31.5-88.8-53.2c-14.8-14.9-28.3-31-40.3-48.2
          c11.7-13.9,24.6-26.8,38.5-38.5c7-5.9,13.8-11.1,20.5-15.6c-14.9,46.9,11,97,57.9,111.9c8.7,2.8,17.8,4.2,26.9,4.2
          c1.3,0,2.5,0,3.8-0.1L235.2,342.6z"
        />
      </Fragment>
    );
  };

  return (
    <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGEyeClosed} />
  );
};

const IconArrow = (props) => {
  const SVGArrow = () => {
    return (
      <path
        className="icon-fill"
        d="M407.9,248c-0.1-0.2-0.3-0.3-0.5-0.5l-142.8-115c-0.6-0.5-1.3-0.7-2-0.7l0,0c-1.8,0-3.2,1.4-3.2,3.2l0,0v67.7H93.7
        c-1.3,0-2.4,1.1-2.4,2.4v99.7c0,1.3,1.1,2.4,2.4,2.4l0,0h165.7v58c0,1.8,1.4,3.2,3.2,3.2l0,0c0.7,0,1.4-0.3,2-0.7l142.8-115
        C408.8,251.4,409,249.4,407.9,248z"
      />
    );
  };
  return <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGArrow} />;
};

const IconCopy = (props) => {
  const SVGCopy = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M52.3,62.6H22.1h-8.6h-2.1c-4.8,0-8.7,3.9-8.7,8.7v84.9c0,4.8,3.9,8.7,8.7,8.7l9.3,0l56.7,0
          c3.9,0,7.2-2.5,8.3-6c0.3-0.8,0.4-1.7,0.4-2.7l-0.2-56.1L52.3,62.6z M72.5,102H49V76L72.5,102z M72.5,150.1c0,2.2-1.8,3.9-3.9,3.9
          H19.4c-2.2,0-3.9-1.8-3.9-3.9V79.9c0-2.2,1.8-3.9,3.9-3.9h17.3c2.2,0,3.9,1.8,3.9,3.9l0.2,26.1c0,2.2,1.8,3.9,3.9,3.9l23.7,0.1
          c2.2,0,3.9,1.8,3.9,3.9V150.1z"
        />
        <path
          className="icon-fill"
          d="M141.4,22.4l-18.2,0l0-5c-0.1-2.4-2.1-4.2-4.5-4h-4c-0.4-0.9-0.9-1.8-1.5-2.6C109.1,4.9,94.1,2,83.1,2
          c-10.9,0-26,2.9-30.2,8.8c-0.6,0.8-1.1,1.7-1.5,2.6h-3.8c-2.3-0.1-4.3,1.7-4.5,4l-0.1,5l-18.2,0c-7.8,0-14.1,5.7-14.1,12.7v36.5
          l12.8,0l0-27c0-2.9,2.7-5.2,6-5.2h3.9c0,0,4.1,8.6,9.1,8.6l81-0.2c5,0,9.1-8.6,9.1-8.6l3.9,0c3.3,0,6,2.3,6,5.2l-0.3,103
          c0,2.9-2.7,5.2-6,5.2l-57.4-0.1l-0.5,1.8c-1.8,4.5-5.7,10.2-5.7,10.2l2.9,0.4l65.9-0.2c7.8,0,14.1-5.7,14.1-12.7v-117
          C155.5,28.1,149.1,22.4,141.4,22.4z M108.5,33.9l-51,0v-8.7c0.3-0.6,0.7-1.1,1.2-1.7c3.4-3.7,15.7-5.5,24.5-5.5
          c8.8,0,20.8,1.9,24.1,5.5c0.5,0.5,0.9,1.1,1.2,1.7V33.9z"
        />
      </Fragment>
    );
  };

  return (
    <_IconWrapper
      {...props}
      viewbox_width={170}
      viewbox_height={165}
      ChildSVG={SVGCopy}
    />
  );
};

const IconCopyLink = (props) => {
  const SVGCopyLink = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M142.4,22.4l-18.2,0l0-5c-0.1-2.4-2.1-4.2-4.5-4h-4c-0.4-0.9-0.9-1.8-1.5-2.6C110.1,4.9,95.1,2,84.1,2
          c-10.9,0-26,2.9-30.2,8.8c-0.6,0.8-1.1,1.7-1.5,2.6h-3.8c-2.3-0.1-4.3,1.7-4.5,4l-0.1,5l-18.2,0c-7.8,0-14.1,5.7-14.1,12.7v55.7
          l12.8,0l0-46.1c0-2.9,2.7-5.2,6-5.2h3.9c0,0,4.1,8.6,9.1,8.6l81-0.2c5,0,9.1-8.6,9.1-8.6l3.9,0c3.3,0,6,2.3,6,5.2l-0.3,103
          c0,2.9-2.7,5.2-6,5.2l-57.4-0.1l-0.5,1.8c-1.8,4.5-5.7,10.2-5.7,10.2l2.9,0.4l65.9-0.2c7.8,0,14.1-5.7,14.1-12.7v-117
          C156.5,28.1,150.1,22.4,142.4,22.4z M109.5,33.9l-51,0v-8.7c0.3-0.6,0.7-1.1,1.2-1.7c3.4-3.7,15.7-5.5,24.5-5.5
          c8.8,0,20.8,1.9,24.1,5.5c0.5,0.5,0.9,1.1,1.2,1.7V33.9z"
        />
        <path
          className="icon-fill"
          d="M90.5,51.8c-15.5,0-26.6,14-37.7,24.4c1.5,0,3.7-0.7,5.9-0.7c3.7,0,7.4,0.7,11.1,2.2
          c5.9-5.9,11.8-12.5,20.7-12.5c4.4,0,9.6,2.2,13.3,5.2c7.4,7.4,7.4,19.2,0,26.6L84.6,116c-3,3-8.9,5.2-13.3,5.2
          c-10.3,0-15.5-6.7-19.2-14.8l-9.6,9.6c5.9,11.1,14.8,19.2,28.1,19.2c8.9,0,17-3.7,22.1-9.6l19.2-19.2C118.6,99.8,123,91.6,123,82
          C121.5,65.8,106.8,51.8,90.5,51.8L90.5,51.8z"
        />
        <path
          className="icon-fill"
          d="M58.8,141.1l-6.6,6.6c-2.9,3-8.9,5.2-13.3,5.2c-4.4,0-9.6-2.2-13.3-5.2c-7.4-7.4-7.4-19.9,0-26.6L44.7,102
          c3-3,8.9-5.2,13.3-5.2c10.3,0,15.5,7.4,19.2,14.8l9.6-9.6c-5.9-11.1-14.8-19.2-28.1-19.2c-8.9,0-17,3.7-22.1,9.6l-19.2,19.2
          c-12.6,12.6-12.6,32.5,0,44.3c11.8,11.8,32.5,12.6,43.6,0l14-14c-2.2,0.7-4.4,0.7-6.6,0.7C64.7,142.6,61.7,142.6,58.8,141.1
          L58.8,141.1z"
        />
      </Fragment>
    );
  };

  return (
    <_IconWrapper
      {...props}
      viewbox_width={170}
      viewbox_height={165}
      ChildSVG={SVGCopyLink}
    />
  );
};

const IconAttentionTriangle = (props) => {
  const SVGAttentionTriangle = () => {
    return (
      <path
        className="icon-fill"
        d="M482.6,444.2l-222-404.5c-4.7-4.7-12.3-4.7-17,0L19.5,444.2c-4.7,4.7-4.7,12.3,0,17h463.1
        C487.3,456.5,487.3,448.9,482.6,444.2z M252.2,435.5c-18.5,0.1-33.6-14.7-33.8-33.2s14.7-33.6,33.2-33.8c18.5,0,33.6,15,33.8,33.5
        C285.4,420.4,270.6,435.4,252.2,435.5z M288.1,185.1l-11.5,147.7c-0.7,8.5-4.8,14.9-9.6,14.9h-32.2c-4.9,0-9-6.6-9.6-15.3
        l-9.5-147.7c-0.7-10.2,3.8-19.2,9.6-19.2h53.1C284.2,165.5,288.7,174.7,288.1,185.1z"
      />
    );
  };

  return (
    <_IconWrapper
      {...props}
      viewbox_width={500}
      ChildSVG={SVGAttentionTriangle}
    />
  );
};

const IconSearch = (props) => {
  const SVGSearch = () => {
    return (
      <path
        className="icon-fill"
        d="M432.9,408.7C432.9,408.7,432.9,408.7,432.9,408.7L320.4,296.2c20.8-25.5,33.2-58.1,33.2-93.6c0,0,0,0,0,0
        c0-82-66.5-148.5-148.5-148.5S56.7,120.6,56.7,202.6s66.5,148.5,148.5,148.5c28.3,0,54.7-7.9,77.2-21.7l114.9,114.9
        c3.7,3.7,9.6,3.7,13.3,0c0,0,0,0,0,0l22.3-22.3C436.6,418.3,436.6,412.3,432.9,408.7z M205.2,320.1c-64.9,0-117.5-52.6-117.5-117.5
        c0-31.2,12.4-61,34.4-83.1c22-22.1,51.9-34.5,83-34.4c64.9,0,117.5,52.6,117.5,117.5S270,320.1,205.2,320.1z"
      />
    );
  };

  return <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGSearch} />;
};

const IconGitHub = (props) => {
  const SVGGitHub = () => {
    return (
      //<!-- © Font Awesome https://github.com/FortAwesome/Font-Awesome licensed under CC BY 4.0 License -->
      <path
        className="icon-fill"
        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3
        4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7
        4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1
        0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6
        27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9
        20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8
        31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8
        496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1
        1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4
        35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9
        1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      />
    );
  };

  return (
    <_IconWrapper
      {...props}
      viewbox_width={496}
      viewbox_height={512}
      ChildSVG={SVGGitHub}
    />
  );
};

const IconQuestion = (props) => {
  const SVGQuestion = () => {
    return (
      <Fragment>
        <path
          className="icon-fill"
          d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8c0,100.4-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250
          c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
          S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"
        />
        <g>
          <path
            className="icon-fill"
            d="M249.1,324.5c-13.1,0.1-23.6,10.8-23.5,23.9c0.1,13.1,10.8,23.6,23.9,23.5c13-0.1,23.5-10.7,23.5-23.7
            C272.9,335.1,262.2,324.4,249.1,324.5z"
          />
          <path
            className="icon-fill"
            d="M235.7,302.2c-1.7,0-3.2-1.3-3.4-3.1l-0.5-6.1c-2.4-19,4.8-39.8,24.8-61c18-18.7,28-32.4,28-48.3
            c0-18-12.8-30-37.9-30.3c-13,0-27.2,3.4-37.2,9c-1.6,0.9-3.7,0.3-4.6-1.3c-0.1-0.1-0.1-0.2-0.1-0.3l-6.9-15.9
            c-0.7-1.6-0.1-3.4,1.4-4.3c13.5-7.6,34.7-12.6,54.6-12.6c45.9,0,66.7,25,66.7,51.8c0,24-15.2,41.2-34.4,61.3
            c-17.6,18.3-24,33.8-22.8,51.8l0.3,5.6c0.1,1.9-1.4,3.4-3.2,3.5c-0.1,0-0.1,0-0.2,0L235.7,302.2z"
          />
        </g>
      </Fragment>
    );
  };
  return (
    <_IconWrapper
      {...props}
      viewbox_width={500}
      viewbox_height={500}
      ChildSVG={SVGQuestion}
    />
  );
};

const IconTable = (props) => {
  const SVGTable = () => (
    <Fragment>
      <path className="icon-fill" d="M0 0h24v24H0V0z" fill="none" />
      <path
        className="icon-fill"
        d="M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10H3v9z"
      />
    </Fragment>
  );
  return <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGTable} />;
};

const IconRotatePhone = (props) => {
  const SVGRotatePhone = () => (
    <Fragment>
      <path
        d="M51.043,6.173c0,-2.759 -2.24,-5 -5,-5l-40,0c-2.76,0 -5,2.241 -5,5l0,69.27c0,2.76 2.24,5 5,5l40,0c2.76,0 5,-2.24 5,-5l0,-69.27Z"
        style={{ fill: "#ebebeb", stroke: "#000", strokeWidth: "2px" }}
      />
      <path
        d="M98.696,53.957c0,-2.76 -2.24,-5 -5,-5l-87.653,0c-2.76,0 -5,2.24 -5,5l0,40c0,2.76 2.24,5 5,5l87.653,0c2.76,0 5,-2.24 5,-5l0,-40Z"
        style={{ fill: "#ebebeb", stroke: "#000", strokeWidth: "2px" }}
      />
      <path
        d="M36.053,2.169c0,-0.549 -0.446,-0.996 -0.995,-0.996l-18.03,0c-0.549,0 -0.995,0.447 -0.995,0.996l0,1.992c0,0.549 0.446,0.995 0.995,0.995l18.03,0c0.549,0 0.995,-0.446 0.995,-0.995l0,-1.992Z"
        style={{ stroke: "#000", strokeWidth: "2px", fill: "#000" }}
      />
      <path
        d="M97.7,83.801c0.55,0 0.996,-0.447 0.996,-0.996l0,-17.696c0,-0.549 -0.446,-0.996 -0.996,-0.996l-1.991,0c-0.55,0 -0.996,0.447 -0.996,0.996l0,17.696c0,0.549 0.446,0.996 0.996,0.996l1.991,0Z"
        style={{ stroke: "#000", strokeWidth: "2px", fill: "#000" }}
      />
      <path
        id="Reply--small-"
        d="M84.245,29.308l6.5,0l-11,11.5l-11,-11.5l6.5,0c0,-5.5 -4.5,-10 -10,-10c-2.8,0 -5.3,1.1 -7.1,2.9c2.4,-4.1 6.9,-6.9 12.1,-6.9c7.8,0 14,6.3 14,14Z"
        style={{ fillRule: "nonzero", fill: "#000", stroke: "#000" }}
      />
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={100} ChildSVG={SVGRotatePhone} />
  );
};

const IconExpandWindowWidth = (props) => {
  const SVGExpandWindowWidth = () => (
    <Fragment>
      <path
        d="M98.827,25.489c0,-13.492 -10.954,-24.446 -24.446,-24.446l-48.892,0c-13.492,0 -24.446,10.954 -24.446,24.446l0,49.022c0,13.492 10.954,24.446 24.446,24.446l48.892,0c13.492,0 24.446,-10.954 24.446,-24.446l0,-49.022Z"
        style={{ fill: "#ebebeb", stroke: "#000", strokeWidth: "2px" }}
      />
      <path
        d="M12.326,52.989l0,5.551l-8.54,-8.54l8.54,-8.54l0,5.551l26.402,0l0,5.978l-26.402,0Z"
        style={{ fill: "#ebebeb", stroke: "#000", strokeWidth: "2px" }}
      />
      <path
        d="M87.666,52.989l0,5.551l8.54,-8.54l-8.54,-8.54l0,5.551l-26.401,0l0,5.978l26.401,0Z"
        style={{ fill: "#ebebeb", stroke: "#000", strokeWidth: "2px" }}
      />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={100}
      ChildSVG={SVGExpandWindowWidth}
    />
  );
};

const IconFacebook = (props) => {
  const SVGFacebook = () => (
    <path
      className="icon-fill"
      d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"
    ></path>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={448}
      viewbox_height={512}
      ChildSVG={SVGFacebook}
    />
  );
};
const IconTwitter = (props) => {
  const SVGTwitter = () => (
    <path
      className="icon-fill"
      d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-48.9 158.8c.2 2.8.2 5.7.2 8.5 0 86.7-66 186.6-186.6 186.6-37.2 0-71.7-10.8-100.7-29.4 5.3.6 10.4.8 15.8.8 30.7 0 58.9-10.4 81.4-28-28.8-.6-53-19.5-61.3-45.5 10.1 1.5 19.2 1.5 29.6-1.2-30-6.1-52.5-32.5-52.5-64.4v-.8c8.7 4.9 18.9 7.9 29.6 8.3a65.447 65.447 0 0 1-29.2-54.6c0-12.2 3.2-23.4 8.9-33.1 32.3 39.8 80.8 65.8 135.2 68.6-9.3-44.5 24-80.6 64-80.6 18.9 0 35.9 7.9 47.9 20.7 14.8-2.8 29-8.3 41.6-15.8-4.9 15.2-15.2 28-28.8 36.1 13.2-1.4 26-5.1 37.8-10.2-8.9 13.1-20.1 24.7-32.9 34z"
    ></path>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={448}
      viewbox_height={512}
      ChildSVG={SVGTwitter}
    />
  );
};
const IconReddit = (props) => {
  const SVGReddit = () => (
    <path
      className="icon-fill"
      d="M283.2 345.5c2.7 2.7 2.7 6.8 0 9.2-24.5 24.5-93.8 24.6-118.4 0-2.7-2.4-2.7-6.5 0-9.2 2.4-2.4 6.5-2.4 8.9 0 18.7 19.2 81 19.6 100.5 0 2.4-2.3 6.6-2.3 9 0zm-91.3-53.8c0-14.9-11.9-26.8-26.5-26.8-14.9 0-26.8 11.9-26.8 26.8 0 14.6 11.9 26.5 26.8 26.5 14.6 0 26.5-11.9 26.5-26.5zm90.7-26.8c-14.6 0-26.5 11.9-26.5 26.8 0 14.6 11.9 26.5 26.5 26.5 14.9 0 26.8-11.9 26.8-26.5 0-14.9-11.9-26.8-26.8-26.8zM448 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48zm-99.7 140.6c-10.1 0-19 4.2-25.6 10.7-24.1-16.7-56.5-27.4-92.5-28.6l18.7-84.2 59.5 13.4c0 14.6 11.9 26.5 26.5 26.5 14.9 0 26.8-12.2 26.8-26.8 0-14.6-11.9-26.8-26.8-26.8-10.4 0-19.3 6.2-23.8 14.9l-65.7-14.6c-3.3-.9-6.5 1.5-7.4 4.8l-20.5 92.8c-35.7 1.5-67.8 12.2-91.9 28.9-6.5-6.8-15.8-11-25.9-11-37.5 0-49.8 50.4-15.5 67.5-1.2 5.4-1.8 11-1.8 16.7 0 56.5 63.7 102.3 141.9 102.3 78.5 0 142.2-45.8 142.2-102.3 0-5.7-.6-11.6-2.1-17 33.6-17.2 21.2-67.2-16.1-67.2z"
    ></path>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={448}
      viewbox_height={512}
      ChildSVG={SVGReddit}
    />
  );
};
const IconEmail = (props) => {
  const SVGEmail = () => (
    <path
      className="icon-fill"
      d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM178.117 262.104C87.429 196.287 88.353 196.121 64 177.167V152c0-13.255 10.745-24 24-24h272c13.255 0 24 10.745 24 24v25.167c-24.371 18.969-23.434 19.124-114.117 84.938-10.5 7.655-31.392 26.12-45.883 25.894-14.503.218-35.367-18.227-45.883-25.895zM384 217.775V360c0 13.255-10.745 24-24 24H88c-13.255 0-24-10.745-24-24V217.775c13.958 10.794 33.329 25.236 95.303 70.214 14.162 10.341 37.975 32.145 64.694 32.01 26.887.134 51.037-22.041 64.72-32.025 61.958-44.965 81.325-59.406 95.283-70.199z"
    ></path>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={448}
      viewbox_height={512}
      ChildSVG={SVGEmail}
    />
  );
};
const IconPin = (props) => {
  const SVGPin = () => (
    <Fragment>
      <rect x="13.95" y="-0.091" width="70.926" height="10.169" />
      <rect x="29.987" y="10.078" width="40.156" height="29.922" />
      <path
        d="M29.987,40c0,0 -22.947,7.106 -22.947,26.01"
        style={{ strokeWidth: "1px" }}
      />
      <path
        d="M70.143,40c0,0 22.805,7.106 22.805,26.01"
        style={{ strokeWidth: "1px" }}
      />
      <path
        d="M7.04,66.01l85.908,0"
        style={{
          fill: "none",
          strokeWidth: "1px",
        }}
      />
      <path
        d="M29.987,40l-22.947,26.01l85.908,0l-22.805,-26.01l-40.156,0Z"
        style={{ strokeWidth: "1px" }}
      />
      <path d="M55.02,64.511c0,-2.77 -2.25,-5.019 -5.02,-5.019c-2.77,0 -5.02,2.249 -5.02,5.019l0,30.469c0,2.771 2.25,5.02 5.02,5.02c2.77,0 5.02,-2.249 5.02,-5.02l0,-30.469Z" />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={100} ChildSVG={SVGPin} />;
};

const IconUnpin = (props) => {
  const SVGUnpin = () => (
    <Fragment>
      <path
        d="M70.214,40c0,0 22.805,7.106 22.805,26.01"
        style={{ strokeWidth: "1px" }}
      />
      <path d="M96.488,86.509l-88.901,-78.93l-5.249,5.912l88.901,78.93l5.249,-5.912Z" />
      <path d="M84.876,10.078l-66.879,0l-4.047,-3.592l0,-6.577l70.926,0l0,10.169Z" />
      <path
        d="M25.703,41.758l1.572,1.396l-20.164,22.856c0,-13.634 11.937,-21.132 18.592,-24.252Z"
        style={{ strokeWidth: "1px" }}
      />
      <path d="M46.892,59.894l8.128,7.216l0,27.194c0,2.77 -2.25,5.019 -5.02,5.019c-2.77,0 -5.02,-2.249 -5.02,-5.019l0,-30.47c0,-1.597 0.748,-3.021 1.912,-3.94Z" />
      <path d="M70.143,40l-18.445,0l-21.711,-19.276l0,-10.646l40.156,0l0,29.922Zm-27.871,0l-9.124,0l-3.161,-2.807l0,-8.1l12.285,10.907Z" />
      <path
        d="M27.031,42.938l25.987,23.072l-45.907,0l19.92,-23.072Zm65.988,23.072l-11.954,0l-29.296,-26.579l18.374,0.569l22.876,26.01Zm-21.451,0l-9.124,0l-29.936,-26.579l9.123,0l29.937,26.579Z"
        style={{ strokeWidth: "1px" }}
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={100} ChildSVG={SVGUnpin} />;
};

export {
  IconHome,
  IconFeedback,
  IconAbout,
  IconGlossary,
  IconDataset,
  IconShare,
  IconPermalink,
  IconDownload,
  IconChevron,
  IconZoomIn,
  IconZoomOut,
  IconFilterColumns,
  IconCheckmark,
  IconCheck,
  IconAttention,
  IconNotApplicable,
  IconClock,
  IconEyeOpen,
  IconEyeClosed,
  IconArrow,
  IconCopy,
  IconCopyLink,
  IconAttentionTriangle,
  IconSearch,
  IconGitHub,
  IconQuestion,
  IconTable,
  IconRotatePhone,
  IconExpandWindowWidth,
  IconTwitter,
  IconFacebook,
  IconReddit,
  IconEmail,
  IconPin,
  IconUnpin,
};
