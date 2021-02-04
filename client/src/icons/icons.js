import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { textColor, tertiaryColor } from "src/core/color_defs.js";

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
const IconGear = (props) => {
  const SVGGear = () => (
    <path
      d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
      style={{ stroke: "#000", strokeWidth: "1px" }}
    />
  );

  return (
    <_IconWrapper
      {...props}
      viewbow_width={512}
      viewbow_height={512}
      ChildSVG={SVGGear}
    />
  );
};

const IconPartitionIcon = (props) => {
  const SVGPartitionIcon = () => (
    <Fragment>
      <path
        id="path4491"
        className="icon-partition-1"
        d="M111.1644,216.8344V76.6461L4,7V150.517l104.2484,67.5977,2.916-1.28"
      />
      <rect
        className="icon-partition-2"
        x="111.1644"
        y="77.1582"
        width="117.3706"
        height="141.0845"
      />
      <polygon
        className="icon-partition-3"
        points="327.602 208.947 232.44 176.333 231.607 77.158 328.008 109.656 327.602 208.947"
      />
      <polygon
        className="icon-partition-3"
        points="326.274 267.533 231.607 218.243 231.607 180.686 326.274 229.976 326.274 267.533"
      />
      <polygon
        className="icon-partition-2"
        points="330.968 110.424 447 110.424 446.595 209.075 330.563 209.075 330.968 110.424"
      />
      <rect
        className="icon-partition-2"
        x="328.4131"
        y="229.8479"
        width="118.1815"
        height="37.5568"
      />
      <path
        id="path4491-2"
        data-name="path4491"
        className="icon-partition-1"
        d="M111.5588,330.9921V242.1258L4,157.65v90.9764l104.6427,83.1774,2.9161-.8116"
      />
      <rect
        className="icon-partition-2"
        x="111.5588"
        y="242.4504"
        width="117.3706"
        height="89.4344"
      />
      <polygon
        className="icon-partition-3"
        points="327.208 341.887 232.44 300.948 232.002 242.45 327.602 287.691 327.208 341.887"
      />
      <polygon
        className="icon-partition-3"
        points="327.627 391 232.002 331.885 231.607 303.707 327.233 362.822 327.627 391"
      />
      <polygon
        className="icon-partition-2"
        points="330.563 288.178 446.595 288.178 446.2 341.968 330.168 341.968 330.563 288.178"
      />
      <polygon
        className="icon-partition-2"
        points="330.278 362.741 446.285 362.741 446.509 390.924 330.503 390.924 330.278 362.741"
      />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={450}
      viewbox_height={395}
      ChildSVG={SVGPartitionIcon}
    />
  );
};

const IconCompareEstimates = (props) => {
  const SVGCompareEstimates = () => (
    <Fragment>
      <path
        d="M75.9462,510.5352H524.0538A37.1365,37.1365,0,0,1,561.19,547.6718V561.19a0,0,0,0,1,0,0H38.81a0,0,0,0,1,0,0V547.6718A37.1365,37.1365,0,0,1,75.9462,510.5352Z"
        fill="#2C70C9"
      />
      <rect
        x="286.8086"
        y="38.8097"
        width="26.3829"
        height="468.5596"
        rx="7.4442"
        ry="7.4442"
        fill="#2C70C9"
      />
      <path
        d="M268.5881,81.4007c-18.9979-1.527-31.9656,4.2623-40.4607,10.1152-9.3347,6.4313-11.647,11.8217-30.86,33.5638-15.86,17.9473-23.7893,26.9209-32.2314,33.5638-10.5857,8.33-27.6369,17.8848-53.4905,18.3911"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="20"
      />
      <g>
        <line
          x1="112.0983"
          y1="202.6913"
          x2="46.2155"
          y2="328.3843"
          fill="none"
          stroke="#2C70C9"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="18"
        />
        <line
          x1="177.5793"
          y1="328.3843"
          x2="112.0983"
          y2="202.6913"
          fill="none"
          stroke="#2C70C9"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="18"
        />
      </g>
      <path
        d="M331.4119,81.4007c18.9979-1.527,31.9656,4.2623,40.4607,10.1152,9.3347,6.4313,11.647,11.8217,30.86,33.5638,15.8595,17.9473,23.7893,26.9209,32.2314,33.5638,10.5857,8.33,27.6369,17.8848,53.4905,18.3911"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="20"
      />
      <g>
        <line
          x1="487.9017"
          y1="202.6913"
          x2="553.7845"
          y2="328.3843"
          fill="none"
          stroke="#2C70C9"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="18"
        />
        <line
          x1="422.4207"
          y1="328.3843"
          x2="487.9017"
          y2="202.6913"
          fill="none"
          stroke="#2C70C9"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="18"
        />
      </g>
      <path
        d="M25.6255,344.83c0,53.6208,38.6252,97.089,86.272,97.089s86.2719-43.4682,86.2719-97.089Zm123.8662,52.9349H73.6v-8.7809h75.8921Z"
        fill="#2C70C9"
      />
      <path
        d="M401.8306,344.83c0,53.6208,38.6253,97.089,86.2719,97.089s86.272-43.4682,86.272-97.089Zm124.6325,52.8166H493.1687v34.9151H483.74V397.6462H450.4456v-8.8393H483.74v-34.62h9.4285v34.62h33.2944Z"
        fill="#2C70C9"
      />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={600}
      ChildSVG={SVGCompareEstimates}
    />
  );
};

const IconStructure = (props) => {
  const SVGStructure = () => (
    <Fragment>
      <rect
        x="233.69"
        y="103"
        width="132.62"
        height="116"
        rx="17.75"
        ry="17.75"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="20"
      />
      <rect
        x="233.69"
        y="381"
        width="132.62"
        height="116"
        rx="17.75"
        ry="17.75"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="20"
      />
      <rect
        x="415.38"
        y="381"
        width="132.63"
        height="116"
        rx="17.75"
        ry="17.75"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="20"
      />
      <rect
        x="52"
        y="381"
        width="132.63"
        height="116"
        rx="17.75"
        ry="17.75"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="20"
      />
      <line
        x1="300"
        y1="228"
        x2="300"
        y2="381"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
      <line
        x1="118"
        y1="292"
        x2="482"
        y2="292"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
      <line
        x1="482"
        y1="292"
        x2="482"
        y2="381"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
      <line
        x1="118"
        y1="377"
        x2="118"
        y2="293"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGStructure} />
  );
};

const IconTreemap = (props) => {
  const SVGTreemap = () => (
    <Fragment>
      <g>
        <path
          className="treemap-1"
          d="M526.5,76.5V532H69.1V76.5H526.5 M526.5,52.5H69.1c-13.3,0-24,10.7-24,24V532c0,13.3,10.7,24,24,24h457.5
		c13.3,0,24-10.7,24-24V76.5C550.5,63.2,539.8,52.5,526.5,52.5L526.5,52.5z"
        />
      </g>
      <rect
        x="332.7"
        y="100.3"
        className="treemap-2"
        width="171.3"
        height="204.9"
      />
      <rect
        x="91.2"
        y="100.3"
        className="treemap-2"
        width="216"
        height="409.7"
      />
      <rect
        x="332.7"
        y="329.8"
        className="treemap-2"
        width="171.3"
        height="107.1"
      />
      <rect
        x="332.7"
        y="462.7"
        className="treemap-2"
        width="83"
        height="47.3"
      />
      <rect
        x="440.3"
        y="462.7"
        className="treemap-2"
        width="63.7"
        height="47.3"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGTreemap} />;
};
const IconExplorer = (props) => {
  const SVGExplorer = () => (
    <Fragment>
      <polygon
        points="81.14 269.12 93.11 286.18 293.87 119.9 81.14 269.12"
        fill="none"
      />
      <path
        d="M434.47,167h0a12.38,12.38,0,0,0-.08-5.38,13.83,13.83,0,0,0-2.2-4.91,13.37,13.37,0,0,0-8-5.51,11.09,11.09,0,0,0-2.33-.26,9.22,9.22,0,0,0-5.34,1.64,10.15,10.15,0,0,0-4,9,14.14,14.14,0,0,0,8.38,12,10.16,10.16,0,0,0,9.86-.69A9.43,9.43,0,0,0,434.47,167Z"
        fill="none"
      />
      <path
        d="M205,491a23.67,23.67,0,0,1-5-.54,25,25,0,0,1-15.15-10.14l-113-161.12-25.7,21.28a17.81,17.81,0,0,0-2.35,25L176.38,525.59a17.8,17.8,0,0,0,25,2.35L432.12,336.81l-213.86,150A23.15,23.15,0,0,1,205,491Z"
        fill="#2C70C9"
      />
      <path
        d="M482.86,109.1,342,70.4a23.33,23.33,0,0,0-23.64,1.78L65.66,249.44a23.33,23.33,0,0,0-9.62,16,24.94,24.94,0,0,0,4.38,17.7l13.37,19.07,113,161.12A25,25,0,0,0,202,473.44a23.67,23.67,0,0,0,5,.54,23.15,23.15,0,0,0,13.28-4.15l213.86-150L473,292.57a23.55,23.55,0,0,0,9.67-22l11.56-145.34A15.5,15.5,0,0,0,482.86,109.1ZM207,448.58,93.11,286.18l-12-17.06L293.87,119.9l33-23.14,4.94-3.47.81.46,136,37.37-9.06,114-2.11,26.62.2,1.05Z"
        fill="#2C70C9"
      />
      <path
        d="M442.89,121.59c8.28-9.5,19.83-18.53,33.66-25.64,35-18,71.35-16.9,81.26,2.39s-10.41,49.48-45.37,67.45-71.35,16.9-81.26-2.39c-2.84-5.53-3.19-12-1.43-18.75"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="14"
      />
      <path
        d="M420.8,149.47A21.79,21.79,0,1,1,399,171.26a21.81,21.81,0,0,1,21.78-21.79m0-10a31.79,31.79,0,1,0,31.78,31.79,31.78,31.78,0,0,0-31.78-31.79Z"
        fill="#2C70C9"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGExplorer} />;
};
const IconBuilder = (props) => {
  const SVGBuilder = () => (
    <Fragment>
      <g>
        <polygon
          points="454.37 138.13 414.7 95.13 414.91 138.36 454.37 138.13"
          fill="none"
        />
        <path
          d="M403.7,161.1h-.07a11.35,11.35,0,0,1-11.34-11.28L392,89.1H141.17a1.61,1.61,0,0,0-1.61,1.62V509.28a1.61,1.61,0,0,0,1.61,1.62H458.83a1.61,1.61,0,0,0,1.61-1.62V160.78Z"
          fill="none"
        />
        <path
          d="M421.55,60.75H141.17a30,30,0,0,0-30,30V509.28a30,30,0,0,0,30,30H458.83a30,30,0,0,0,30-30V133.63Zm32.82,77.38-39.46.23-.21-43.23Zm4.46,372.77H141.17a1.61,1.61,0,0,1-1.61-1.62V90.72a1.61,1.61,0,0,1,1.61-1.62H392l.3,60.72a11.35,11.35,0,0,0,11.34,11.28h.07l56.74-.32v348.5A1.61,1.61,0,0,1,458.83,510.9Z"
          fill="#2C70C9"
        />
      </g>
      <rect
        x="180.5"
        y="239.5"
        width="230"
        height="44"
        rx="12.51"
        ry="12.51"
        fill="#2C70C9"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeMiterlimit="50"
        strokeWidth="5"
      />
      <rect
        x="180.5"
        y="302.5"
        width="182"
        height="44"
        rx="11.13"
        ry="11.13"
        fill="#2C70C9"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeMiterlimit="50"
        strokeWidth="5"
      />
      <rect
        x="180.5"
        y="365.5"
        width="141"
        height="44"
        rx="9.8"
        ry="9.8"
        fill="#2C70C9"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeMiterlimit="50"
        strokeWidth="5"
      />
      <rect
        x="180.5"
        y="428.5"
        width="201"
        height="44"
        rx="11.7"
        ry="11.7"
        fill="#2C70C9"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeMiterlimit="50"
        strokeWidth="5"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGBuilder} />;
};
const IconLab = (props) => {
  const SVGLab = () => (
    <Fragment>
      <path
        className="lab-1"
        d="M169.7,49.7l-1,91.3l0,0l68.6,167.2H34.5l67.6-167.2l0,0V49.7h-1.7c-7.1,0-12.8-5.8-12.8-12.8v-1.6
		c0-7.1,5.8-12.8,12.8-12.8h71c7.1,0,12.8,5.8,12.8,12.8v1.6c0,7.1-5.8,12.8-12.8,12.8H169.7z"
      />
      <line className="lab-2" x1="92.3" y1="165.3" x2="178.8" y2="165.3" />
      <circle className="lab-2" cx="108.5" cy="234.7" r="8.1" />
      <circle className="lab-2" cx="145.9" cy="197.3" r="5.1" />
      <circle className="lab-2" cx="164.2" cy="257.7" r="8" />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={270}
      viewbox_height={335}
      ChildSVG={SVGLab}
    />
  );
};

const IconMoney = (props) => {
  const SVGMoney = () => (
    <Fragment>
      <path
        d="M102.6453,477.5735,78.3685,511.636H539.5736A11.4513,11.4513,0,0,1,551,523.0315v5.5119a11.4312,11.4312,0,0,1-11.4262,11.3954H53.1309a1.2661,1.2661,0,0,1-.34-.031h-.3719a10.8312,10.8312,0,0,1-6.9673-2.601l-3.0656-2.6323a13.4555,13.4555,0,0,1-2.0125-17.7123l71.2214-99.9579A85.7981,85.7981,0,0,1,96.5761,404.37q-24.4322-25.64-27.9932-67.5057a4.7947,4.7947,0,0,1,4.8928-5.0782H96.0809a4.8687,4.8687,0,0,1,4.83,4.1493q3.8091,24.5252,20.1278,39.5434A57.784,57.784,0,0,0,134.54,384.8l5.574-7.8345,14.8327-20.84,13.6867-19.1989,28.1482-39.4814,4.3039-6.0694q-11.5193-10.4972-31.771-17.3408L138.318,263.0423Q105.5248,251.6158,90.6,230.4661,75.7365,209.332,75.7052,174.1083q0-42.0827,23.5343-68.0319a76.0216,76.0216,0,0,1,36.54-22.667V69.5368a9.4951,9.4951,0,0,1,9.475-9.4756h30.0685a9.5152,9.5152,0,0,1,9.475,9.4756V83.44q19.7871,5.8991,34.8985,22.2954,22.1562,24.014,25.1446,60.693a4.6116,4.6116,0,0,1-4.6448,4.9237H218.86a4.6829,4.6829,0,0,1-4.5829-3.9638q-3.7626-22.5275-17.0932-35.7035-14.4915-14.26-37.097-14.2754-24.1067,0-38.7383,15.08-14.6775,15.0959-14.6778,40.2556,0,19.4158,10.807,31.5542c7.2153,8.0822,19.1057,14.9875,35.7657,20.8091l25.2679,9.135c19.4156,6.5957,34.4964,14.9873,45.3964,25.0822l3.4678-4.8616,3.8707-5.388,3.5615-5.0475,6.8434-9.5683,9.6919-13.5941,18.2083-25.5778a10.9451,10.9451,0,0,1,16.2261-2.1986l2.3534,1.9818.093.093,93.8879,67.97,133.9893-19.54-3.4678-28.4266a2.4258,2.4258,0,0,1,3.9637-2.1366l44.59,37.19a2.4431,2.4431,0,0,1,.434,3.2513l-34.1245,48.6784a2.4386,2.4386,0,0,1-4.3976-1.1147l-3.4368-28.179L380.7187,293.0792l-.124.031a9.28,9.28,0,0,1-8.0507-1.4865l-90.606-65.6476-15.8239,22.1716-9.1658,12.8817-9.6919,13.5631-2.3225,3.2823-4.6146,6.441-20.282,28.52-3.3136,4.6139L192.106,352.0381l-5.9149,8.2678-11.8594,16.66-9.847,13.8419-3.0966,4.3041-3.5305,4.9546-12.4793,17.5266-.9911,1.3935-4.2729,6.0074-10.9931,15.39Z"
        fill="#2C70C9"
      />
      <path
        d="M382.7345,313.6538a19.8858,19.8858,0,0,1-3.8113.3691,19.485,19.485,0,0,1-11.1722-3.52L323.1979,279.536l-.5808,203.4768c-.0221,7.649,6.4806,13.9244,14.45,13.9454l54.4131.1429c7.9693.021,14.5074-6.22,14.5295-13.8691l.4933-172.9267-23.53,3.29C382.8921,313.6114,382.8149,313.6381,382.7345,313.6538Z"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <path
        d="M426.702,483.4531c-.0213,7.4058,6.2749,13.4816,13.9912,13.502l55.3328.1455c7.7171.02,14.0472-6.0226,14.0685-13.4284L510.63,295.75,427.204,307.4117Z"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <path
        d="M176.7627,400.5554l-3.072,4.3109-3.5308,4.9568-12.4993,17.5432-.9843,1.3815-4.28,6.0072-10.9736,15.4023L114.932,487.34a11.6149,11.6149,0,0,0,11.541,9.5987l59.8935.1575A11.5571,11.5571,0,0,0,198.1479,485.85l.331-115.7758-11.857,16.6429Z"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <path
        d="M218.8356,341.5591l-.4019,140.8527c-.0237,7.9809,6.7619,14.5285,15.0764,14.55l53.1553.14c8.3153.0218,15.1379-6.49,15.1607-14.4712l.62-217.5179-17.72-12.3171Z"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGMoney} />;
};

const IconEmployee = (props) => {
  const SVGEmployee = () => (
    <Fragment>
      <rect
        x="279.0583"
        y="58.5637"
        width="28.118"
        height="482.8726"
        rx="5.2758"
        ry="5.2758"
        fill="#2C70C9"
      />
      <ellipse
        cx="152.8389"
        cy="120.0486"
        rx="53.0747"
        ry="52.8594"
        fill="#2C70C9"
      />
      <path
        d="M152.8384,197.9749c-58.2333,0-105.44,25.8729-105.44,57.7887V511.849c0,15.3522,18.43,27.9129,40.9573,27.9129H217.3222c22.526,0,40.9573-12.5607,40.9573-27.9129V255.7636C258.2795,223.8478,211.0727,197.9749,152.8384,197.9749Z"
        fill="#2C70C9"
      />
      <rect
        x="344.6438"
        y="61.5487"
        width="79.8902"
        height="105.1359"
        rx="8.8547"
        ry="8.8547"
        transform="translate(498.7056 -270.4723) rotate(90)"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <rect
        x="387.9357"
        y="144.2819"
        width="79.8902"
        height="191.7195"
        rx="11.9573"
        ry="11.9573"
        transform="translate(668.0225 -187.7391) rotate(90)"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <rect
        x="373.5051"
        y="284.7376"
        width="79.8902"
        height="162.8583"
        rx="11.0206"
        ry="11.0206"
        transform="translate(779.6169 -47.2834) rotate(90)"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <rect
        x="402.3663"
        y="381.9015"
        width="79.8902"
        height="220.5808"
        rx="12.8258"
        ry="12.8258"
        transform="translate(934.5032 49.8805) rotate(90)"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGEmployee} />;
};

const IconTree = (props) => {
  const SVGTree = () => (
    <Fragment>
      <path
        d="M251.436,84.5h97.1279a17.7486,17.7486,0,0,1,17.7486,17.7486v80.5029A17.7486,17.7486,0,0,1,348.5639,200.5H251.436a17.7485,17.7485,0,0,1-17.7485-17.7485V102.2485A17.7485,17.7485,0,0,1,251.436,84.5Z"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="25"
      />
      <path
        d="M251.436,399.5h97.1279a17.7486,17.7486,0,0,1,17.7486,17.7486v80.5029A17.7486,17.7486,0,0,1,348.5639,515.5H251.436a17.7485,17.7485,0,0,1-17.7485-17.7485V417.2485A17.7485,17.7485,0,0,1,251.436,399.5Z"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="25"
      />
      <rect
        x="415.375"
        y="399.5"
        width="132.625"
        height="116"
        rx="17.7486"
        ry="17.7486"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="25"
      />
      <rect
        x="52"
        y="399.5"
        width="132.625"
        height="116"
        rx="17.7486"
        ry="17.7486"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="50"
        strokeWidth="25"
      />
      <line
        x1="300"
        y1="209.5"
        x2="300"
        y2="399.5"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="25"
      />
      <line
        x1="118"
        y1="290.7854"
        x2="482"
        y2="290.7854"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="25"
      />
      <line
        x1="482"
        y1="292.1839"
        x2="482"
        y2="399.5"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="25"
      />
      <line
        x1="118"
        y1="395.5"
        x2="118"
        y2="293.8374"
        fill="none"
        stroke="#2C70C9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="25"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGTree} />;
};

const IconClipboard = (props) => {
  const SVGClipboard = () => (
    <Fragment>
      <path
        d="M480.578,114.5581l-39.9963-.0961-4.6829.0961v46.3651c0,1.2759-1.53,2.3948-3.2774,2.3948H167.3786c-1.747,0-3.2774-1.1189-3.2774-2.3948V114.462l-44.6792.0961c-24.0637,0-43.64,17.64-43.64,39.3241v362.74c0,21.6842,19.5759,39.3241,43.64,39.3241H480.578c24.0637,0,43.64-17.64,43.64-39.3241v-362.74C524.2176,132.198,504.6417,114.5581,480.578,114.5581ZM167.3786,186.54H432.6214c15.5638,0,28.2252-11.4922,28.2252-25.617V137.78H480.578c10.3078,0,18.6918,7.2239,18.6918,16.1019v362.74c0,8.8779-8.384,16.1019-18.6918,16.1019H119.422c-10.3078,0-18.6918-7.224-18.6918-16.1019v-362.74c0-8.878,8.384-16.1019,18.6918-16.1019H139.15v23.1429C139.15,175.048,151.8148,186.54,167.3786,186.54Z"
        fill="#2C70C9"
      />
      <g>
        <path
          d="M411.6587,136.7243H188.3413V95.5348l46.5494.0045c1.49-20.5524,32.4623-37.6284,68.9581-37.6284s67.4683,17.076,68.9582,37.6284l38.8517-.0045Zm-220.2166-3.1009H408.5579V98.6356l-38.7943.0046V97.09c0-19.5561-30.1851-36.0779-65.9148-36.0779S237.9341,77.5336,237.9341,97.09v1.55l-46.492-.0046Z"
          fill="#2C70C9"
        />
        <g>
          <path
            d="M411.8632,83.2284H383.9459a41.0579,41.0579,0,0,0-4.6186-7.9489c-13.0127-17.6732-41.56-29.6748-75.4785-29.6748S241.3854,57.6063,228.3715,75.28a41.0528,41.0528,0,0,0-4.6186,7.9489H188.1365c-7.6242,0-13.828,5.5164-13.828,12.2958V136.736c0,6.7794,6.2038,12.2947,13.828,12.2947H411.8632c7.6242,0,13.8281-5.5153,13.8281-12.2947V95.5242C425.6913,88.7448,419.4874,83.2284,411.8632,83.2284Zm-1.7551,51.9459H189.8917V97.0848h30.91v.0045H236.385c0-20.3967,30.895-37.6282,67.4638-37.6282,36.5712,0,67.4662,17.2315,67.4662,37.6282h15.5832v-.0045h23.21Z"
            fill="#2C70C9"
          />
          <path
            d="M411.8647,150.5813H188.1353c-8.4789,0-15.3771-6.2108-15.3771-13.8449V95.5242c0-7.6356,6.8982-13.8465,15.3771-13.8465h34.6154a43.2963,43.2963,0,0,1,4.3727-7.3176C240.89,55.667,270.29,44.0539,303.8488,44.0539c33.5616,0,62.9623,11.6131,76.7255,30.3062a43.0959,43.0959,0,0,1,4.3727,7.3176h26.9177c8.4789,0,15.3771,6.2109,15.3771,13.8465v41.2122C427.2418,144.3705,420.3436,150.5813,411.8647,150.5813ZM188.1353,84.7786c-6.768,0-12.2763,4.8209-12.2763,10.7456v41.2122c0,5.9247,5.5083,10.7441,12.2763,10.7441H411.8647c6.768,0,12.2763-4.8194,12.2763-10.7441V95.5242c0-5.9247-5.5083-10.7456-12.2763-10.7456H382.9272l-.4058-.9327a39.5771,39.5771,0,0,0-4.4424-7.6477c-13.1908-17.9148-41.6346-29.0435-74.23-29.0435-32.5925,0-61.0363,11.1287-74.23,29.0435a39.8074,39.8074,0,0,0-4.4454,7.6492l-.4057.9312Zm223.5234,51.9457H188.3413V95.5348l46.5494.0045c1.49-20.5524,32.4623-37.6284,68.9581-37.6284s67.4683,17.076,68.9582,37.6284l38.8517-.0045Zm-220.2166-3.1009H408.5579V98.6356l-38.7943.0046V97.09c0-19.5561-30.1851-36.0779-65.9148-36.0779S237.9341,77.5336,237.9341,97.09v1.55l-46.492-.0046Z"
            fill="#2C70C9"
          />
        </g>
      </g>
      <path
        d="M217.9238,432.631A11.4894,11.4894,0,0,1,229.38,444.0868v38.27a11.4894,11.4894,0,0,1-11.4557,11.4558H171.7323a11.4894,11.4894,0,0,1-11.4557-11.4558v-38.27a11.4893,11.4893,0,0,1,11.4557-11.4558h46.1915m0-7H171.7323a18.4767,18.4767,0,0,0-18.4557,18.4558v38.27a18.4767,18.4767,0,0,0,18.4557,18.4558h46.1915A18.4767,18.4767,0,0,0,236.38,482.3564v-38.27a18.4767,18.4767,0,0,0-18.4557-18.4558Z"
        fill="#2C70C9"
      />
      <g>
        <path
          d="M217.9238,215.9616A11.4894,11.4894,0,0,1,229.38,227.4174v38.2695a11.49,11.49,0,0,1-11.4557,11.4558H171.7323a11.4894,11.4894,0,0,1-11.4557-11.4558V227.4174a11.4893,11.4893,0,0,1,11.4557-11.4558h46.1915m0-7H171.7323a18.4767,18.4767,0,0,0-18.4557,18.4558v38.2695a18.4767,18.4767,0,0,0,18.4557,18.4558h46.1915A18.4767,18.4767,0,0,0,236.38,265.6869V227.4174a18.4767,18.4767,0,0,0-18.4557-18.4558Z"
          fill="#2C70C9"
        />
        <path
          d="M217.9238,325.1667A11.4894,11.4894,0,0,1,229.38,336.6225V374.892a11.4894,11.4894,0,0,1-11.4557,11.4558H171.7323a11.4893,11.4893,0,0,1-11.4557-11.4558V336.6225a11.4893,11.4893,0,0,1,11.4557-11.4558h46.1915m0-7H171.7323a18.4767,18.4767,0,0,0-18.4557,18.4558V374.892a18.4767,18.4767,0,0,0,18.4557,18.4558h46.1915A18.4767,18.4767,0,0,0,236.38,374.892V336.6225a18.4767,18.4767,0,0,0-18.4557-18.4558Z"
          fill="#2C70C9"
        />
      </g>
      <line
        x1="281.7115"
        y1="248.2929"
        x2="450.9615"
        y2="248.2929"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="7"
      />
      <line
        x1="281.7115"
        y1="355.7572"
        x2="450.9615"
        y2="355.7572"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="7"
      />
      <line
        x1="281.7115"
        y1="463.2216"
        x2="450.9615"
        y2="463.2216"
        fill="none"
        stroke="#2C70C9"
        strokeMiterlimit="10"
        strokeWidth="7"
      />
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGClipboard} />
  );
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
  IconGear,
  IconPartitionIcon,
  IconCompareEstimates,
  IconStructure,
  IconTreemap,
  IconExplorer,
  IconBuilder,
  IconLab,
  IconMoney,
  IconEmployee,
  IconTree,
  IconClipboard,
};
