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
      max_width,
      height, // if falsey will assume square using width
      vertical_align,
      inline,
      aria_hide, // for icons that are displayed next to text that repeats what the icon represents
      direct_render, //skip <g>

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
        maxWidth: max_width,
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
        {direct_render ? (
          <ChildSVG />
        ) : (
          <g
            id={icon_instance_id}
            style={!alternate_color ? { fill: color, stroke: color } : {}}
            transform={rotation ? `rotate(${rotation} 250 250)` : ""}
          >
            <ChildSVG />
          </g>
        )}
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
  const SVGAbout = () => (
    <Fragment>
      <path d="M90,15.14A73.93,73.93,0,1,1,16.07,89.07,74.014,74.014,0,0,1,90,15.14m0-11a84.93,84.93,0,1,0,84.93,84.93A84.93,84.93,0,0,0,90,4.14Z" />
      <path d="M112.0845,128.1908c-7.6729,15.5011-18.0286,23.2278-24.2028,24.4582-5.8109,1.1581-8.7485-4.1088-8.1211-18.017.6285-16.74,1.1442-27.4167,1.5544-42.4135.113-6.0649-.2846-8.0631-2.4636-7.6289-2.5423.5065-6.2136,4.8256-8.7944,8.9278l-2.1415-2.2165c6.4-11.4707,17.9554-22.648,24.8558-24.023,6.3563-1.2665,7.6961,4.5087,7.3934,20.9954-.4819,13.6891-.963,27.38-1.4811,40.8879-.2581,5.3391.976,6.792,2.61,6.4667,1.2717-.2535,4.3961-2.5753,8.686-9.472ZM98.0585,36.9593c1.23,6.1747-1.6067,12.7822-7.7809,14.0126-5.0852,1.013-9.0409-1.7861-10.199-7.5974-1.05-5.2663,1.2795-12.5273,8.3615-13.9384C93.7065,28.3865,97.1173,32.238,98.0585,36.9593Z" />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={180} ChildSVG={SVGAbout} />;
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
        <rect
          className="icon-stroke"
          x="21.75"
          y="24.5"
          width="136.25"
          height="147"
          rx="4.2008"
          ry="4.2008"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <line
          className="icon-stroke"
          x1="21.75"
          y1="56.8541"
          x2="157.6515"
          y2="56.8541"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <line
          className="icon-stroke"
          x1="21.75"
          y1="85.6914"
          x2="158"
          y2="85.6914"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <line
          className="icon-stroke"
          x1="21.75"
          y1="114.5287"
          x2="158"
          y2="114.5287"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <line
          className="icon-stroke"
          x1="21.75"
          y1="142.6627"
          x2="158"
          y2="142.6627"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <line
          className="icon-stroke"
          x1="67.0505"
          y1="59.3158"
          x2="67.0505"
          y2="171.1483"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <line
          className="icon-stroke"
          x1="112.6995"
          y1="58.2608"
          x2="112.6995"
          y2="171.1483"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
      </Fragment>
    );
  };

  return <_IconWrapper {...props} viewbox_width={180} ChildSVG={SVGDataset} />;
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

const IconDPs = (props) => {
  const SVGDPs = () => (
    <Fragment>
      <path
        d="M526.5,76.5V532H69.1V76.5H526.5 M526.5,52.5H69.1c-13.3,0-24,10.7-24,24V532c0,13.3,10.7,24,24,24h457.5
		c13.3,0,24-10.7,24-24V76.5C550.5,63.2,539.8,52.5,526.5,52.5L526.5,52.5z"
      />
      <rect
        x="98.9"
        y="107"
        className="icon-stroke"
        width="336.3"
        height="47.3"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <rect
        x="99.7"
        y="181"
        className="icon-stroke"
        width="228.3"
        height="47.3"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <rect
        x="99.7"
        y="255"
        className="icon-stroke"
        width="167.3"
        height="47.3"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <polyline
        className="icon-stroke"
        points="282.2,376.3 99.7,376.3 99.7,329 304.2,329 "
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <circle
        className="icon-stroke"
        cx="392.7"
        cy="395.6"
        r="111.3"
        strokeWidth="20px"
        strokeMiterlimit="10px"
      />
      <path
        className="icon-stroke"
        d="M345.4,395c22.9,37.2,22.9,37.2,22.9,37.2l84.3-62.2"
        strokeWidth="27px"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10px"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGDPs} />;
};

const IconPartition = (props) => {
  const SVGPartitionIcon = () => (
    <Fragment>
      <path
        id="path4491"
        className="icon-stroke"
        d="M111.1644,216.8344V76.6461L4,7V150.517l104.2484,67.5977,2.916-1.28"
        strokeWidth="7px"
        strokeMiterlimit="10px"
      />
      <rect
        className="icon-partition-2"
        x="111.1644"
        y="77.1582"
        width="117.3706"
        height="141.0845"
        strokeWidth="7px"
        strokeMiterlimit="10px"
      />
      <polygon
        className="icon-stroke"
        points="327.602 208.947 232.44 176.333 231.607 77.158 328.008 109.656 327.602 208.947"
        strokeWidth="7px"
        strokeLinejoin="round"
      />
      <polygon
        className="icon-stroke"
        points="326.274 267.533 231.607 218.243 231.607 180.686 326.274 229.976 326.274 267.533"
        strokeWidth="7px"
        strokeLinejoin="round"
      />
      <polygon
        className="icon-partition-2"
        points="330.968 110.424 447 110.424 446.595 209.075 330.563 209.075 330.968 110.424"
        strokeWidth="7px"
        strokeMiterlimit="10px"
      />
      <rect
        className="icon-partition-2"
        x="328.4131"
        y="229.8479"
        width="118.1815"
        height="37.5568"
        strokeWidth="7px"
        strokeMiterlimit="10px"
      />
      <path
        id="path4491-2"
        data-name="path4491"
        className="icon-stroke"
        d="M111.5588,330.9921V242.1258L4,157.65v90.9764l104.6427,83.1774,2.9161-.8116"
        strokeWidth="7px"
        strokeMiterlimit="10px"
      />
      <rect
        className="icon-partition-2"
        x="111.5588"
        y="242.4504"
        width="117.3706"
        height="89.4344"
        strokeWidth="7px"
        strokeMiterlimit="10px"
      />
      <polygon
        className="icon-stroke"
        points="327.208 341.887 232.44 300.948 232.002 242.45 327.602 287.691 327.208 341.887"
        strokeWidth="7px"
        strokeLinejoin="round"
      />
      <polygon
        className="icon-stroke"
        points="327.627 391 232.002 331.885 231.607 303.707 327.233 362.822 327.627 391"
        strokeWidth="7px"
        strokeLinejoin="round"
      />
      <polygon
        className="icon-partition-2"
        points="330.563 288.178 446.595 288.178 446.2 341.968 330.168 341.968 330.563 288.178"
        strokeWidth="7px"
        strokeMiterlimit="10px"
      />
      <polygon
        className="icon-partition-2"
        points="330.278 362.741 446.285 362.741 446.509 390.924 330.503 390.924 330.278 362.741"
        strokeWidth="7px"
        strokeMiterlimit="10px"
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
      <path d="M75.9462,510.5352H524.0538A37.1365,37.1365,0,0,1,561.19,547.6718V561.19a0,0,0,0,1,0,0H38.81a0,0,0,0,1,0,0V547.6718A37.1365,37.1365,0,0,1,75.9462,510.5352Z" />
      <rect
        x="286.8086"
        y="38.8097"
        width="26.3829"
        height="468.5596"
        rx="7.4442"
        ry="7.4442"
      />
      <path
        d="M268.5881,81.4007c-18.9979-1.527-31.9656,4.2623-40.4607,10.1152-9.3347,6.4313-11.647,11.8217-30.86,33.5638-15.86,17.9473-23.7893,26.9209-32.2314,33.5638-10.5857,8.33-27.6369,17.8848-53.4905,18.3911"
        fill="none"
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
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="18"
        />
      </g>
      <path
        d="M331.4119,81.4007c18.9979-1.527,31.9656,4.2623,40.4607,10.1152,9.3347,6.4313,11.647,11.8217,30.86,33.5638,15.8595,17.9473,23.7893,26.9209,32.2314,33.5638,10.5857,8.33,27.6369,17.8848,53.4905,18.3911"
        fill="none"
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
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="18"
        />
      </g>
      <path d="M25.6255,344.83c0,53.6208,38.6252,97.089,86.272,97.089s86.2719-43.4682,86.2719-97.089Zm123.8662,52.9349H73.6v-8.7809h75.8921Z" />
      <path d="M401.8306,344.83c0,53.6208,38.6253,97.089,86.2719,97.089s86.272-43.4682,86.272-97.089Zm124.6325,52.8166H493.1687v34.9151H483.74V397.6462H450.4456v-8.8393H483.74v-34.62h9.4285v34.62h33.2944Z" />
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
        strokeMiterlimit="50"
        strokeWidth="20"
      />
      <line
        x1="300"
        y1="228"
        x2="300"
        y2="381"
        fill="none"
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
          d="M526.5,76.5V532H69.1V76.5H526.5 M526.5,52.5H69.1c-13.3,0-24,10.7-24,24V532c0,13.3,10.7,24,24,24h457.5
          c13.3,0,24-10.7,24-24V76.5C550.5,63.2,539.8,52.5,526.5,52.5L526.5,52.5z"
        />
      </g>
      <rect
        x="332.7"
        y="100.3"
        className="icon-stroke"
        width="171.3"
        height="204.9"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <rect
        x="91.2"
        y="100.3"
        className="icon-stroke"
        width="216"
        height="409.7"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <rect
        x="332.7"
        y="329.8"
        className="icon-stroke"
        width="171.3"
        height="107.1"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <rect
        x="332.7"
        y="462.7"
        className="icon-stroke"
        width="83"
        height="47.3"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
      <rect
        x="440.3"
        y="462.7"
        className="icon-stroke"
        width="63.7"
        height="47.3"
        strokeWidth="15px"
        strokeMiterlimit="10px"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGTreemap} />;
};
const IconExplorer = (props) => {
  const SVGExplorer = () => (
    <Fragment>
      <path d="M205,491a23.67,23.67,0,0,1-5-.54,25,25,0,0,1-15.15-10.14l-113-161.12-25.7,21.28a17.81,17.81,0,0,0-2.35,25L176.38,525.59a17.8,17.8,0,0,0,25,2.35L432.12,336.81l-213.86,150A23.15,23.15,0,0,1,205,491Z" />
      <path d="M482.86,109.1,342,70.4a23.33,23.33,0,0,0-23.64,1.78L65.66,249.44a23.33,23.33,0,0,0-9.62,16,24.94,24.94,0,0,0,4.38,17.7l13.37,19.07,113,161.12A25,25,0,0,0,202,473.44a23.67,23.67,0,0,0,5,.54,23.15,23.15,0,0,0,13.28-4.15l213.86-150L473,292.57a23.55,23.55,0,0,0,9.67-22l11.56-145.34A15.5,15.5,0,0,0,482.86,109.1ZM207,448.58,93.11,286.18l-12-17.06L293.87,119.9l33-23.14,4.94-3.47.81.46,136,37.37-9.06,114-2.11,26.62.2,1.05Z" />
      <path
        d="M442.89,121.59c8.28-9.5,19.83-18.53,33.66-25.64,35-18,71.35-16.9,81.26,2.39s-10.41,49.48-45.37,67.45-71.35,16.9-81.26-2.39c-2.84-5.53-3.19-12-1.43-18.75"
        fill="none"
        strokeMiterlimit="10"
        strokeWidth="14"
      />
      <path d="M420.8,149.47A21.79,21.79,0,1,1,399,171.26a21.81,21.81,0,0,1,21.78-21.79m0-10a31.79,31.79,0,1,0,31.78,31.79,31.78,31.78,0,0,0-31.78-31.79Z" />
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
        <path d="M421.55,60.75H141.17a30,30,0,0,0-30,30V509.28a30,30,0,0,0,30,30H458.83a30,30,0,0,0,30-30V133.63Zm32.82,77.38-39.46.23-.21-43.23Zm4.46,372.77H141.17a1.61,1.61,0,0,1-1.61-1.62V90.72a1.61,1.61,0,0,1,1.61-1.62H392l.3,60.72a11.35,11.35,0,0,0,11.34,11.28h.07l56.74-.32v348.5A1.61,1.61,0,0,1,458.83,510.9Z" />
      </g>
      <rect
        x="180.5"
        y="239.5"
        width="230"
        height="44"
        rx="12.51"
        ry="12.51"
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
        className="icon-stroke"
        d="M169.7,49.7l-1,91.3l0,0l68.6,167.2H34.5l67.6-167.2l0,0V49.7h-1.7c-7.1,0-12.8-5.8-12.8-12.8v-1.6
    c0-7.1,5.8-12.8,12.8-12.8h71c7.1,0,12.8,5.8,12.8,12.8v1.6c0,7.1-5.8,12.8-12.8,12.8H169.7z"
        strokeWidth="15px"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10px"
      />
      <line
        className="icon-stroke"
        x1="92.3"
        y1="165.3"
        x2="178.8"
        y2="165.3"
        strokeWidth="7px"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10px"
      />
      <circle
        className="icon-stroke"
        cx="108.5"
        cy="234.7"
        r="8.1"
        strokeWidth="7px"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10px"
      />
      <circle
        className="icon-stroke"
        cx="145.9"
        cy="197.3"
        r="5.1"
        strokeWidth="7px"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10px"
      />
      <circle
        className="icon-stroke"
        cx="164.2"
        cy="257.7"
        r="8"
        strokeWidth="7px"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10px"
      />
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
      <path d="M102.6453,477.5735,78.3685,511.636H539.5736A11.4513,11.4513,0,0,1,551,523.0315v5.5119a11.4312,11.4312,0,0,1-11.4262,11.3954H53.1309a1.2661,1.2661,0,0,1-.34-.031h-.3719a10.8312,10.8312,0,0,1-6.9673-2.601l-3.0656-2.6323a13.4555,13.4555,0,0,1-2.0125-17.7123l71.2214-99.9579A85.7981,85.7981,0,0,1,96.5761,404.37q-24.4322-25.64-27.9932-67.5057a4.7947,4.7947,0,0,1,4.8928-5.0782H96.0809a4.8687,4.8687,0,0,1,4.83,4.1493q3.8091,24.5252,20.1278,39.5434A57.784,57.784,0,0,0,134.54,384.8l5.574-7.8345,14.8327-20.84,13.6867-19.1989,28.1482-39.4814,4.3039-6.0694q-11.5193-10.4972-31.771-17.3408L138.318,263.0423Q105.5248,251.6158,90.6,230.4661,75.7365,209.332,75.7052,174.1083q0-42.0827,23.5343-68.0319a76.0216,76.0216,0,0,1,36.54-22.667V69.5368a9.4951,9.4951,0,0,1,9.475-9.4756h30.0685a9.5152,9.5152,0,0,1,9.475,9.4756V83.44q19.7871,5.8991,34.8985,22.2954,22.1562,24.014,25.1446,60.693a4.6116,4.6116,0,0,1-4.6448,4.9237H218.86a4.6829,4.6829,0,0,1-4.5829-3.9638q-3.7626-22.5275-17.0932-35.7035-14.4915-14.26-37.097-14.2754-24.1067,0-38.7383,15.08-14.6775,15.0959-14.6778,40.2556,0,19.4158,10.807,31.5542c7.2153,8.0822,19.1057,14.9875,35.7657,20.8091l25.2679,9.135c19.4156,6.5957,34.4964,14.9873,45.3964,25.0822l3.4678-4.8616,3.8707-5.388,3.5615-5.0475,6.8434-9.5683,9.6919-13.5941,18.2083-25.5778a10.9451,10.9451,0,0,1,16.2261-2.1986l2.3534,1.9818.093.093,93.8879,67.97,133.9893-19.54-3.4678-28.4266a2.4258,2.4258,0,0,1,3.9637-2.1366l44.59,37.19a2.4431,2.4431,0,0,1,.434,3.2513l-34.1245,48.6784a2.4386,2.4386,0,0,1-4.3976-1.1147l-3.4368-28.179L380.7187,293.0792l-.124.031a9.28,9.28,0,0,1-8.0507-1.4865l-90.606-65.6476-15.8239,22.1716-9.1658,12.8817-9.6919,13.5631-2.3225,3.2823-4.6146,6.441-20.282,28.52-3.3136,4.6139L192.106,352.0381l-5.9149,8.2678-11.8594,16.66-9.847,13.8419-3.0966,4.3041-3.5305,4.9546-12.4793,17.5266-.9911,1.3935-4.2729,6.0074-10.9931,15.39Z" />
      <path
        d="M382.7345,313.6538a19.8858,19.8858,0,0,1-3.8113.3691,19.485,19.485,0,0,1-11.1722-3.52L323.1979,279.536l-.5808,203.4768c-.0221,7.649,6.4806,13.9244,14.45,13.9454l54.4131.1429c7.9693.021,14.5074-6.22,14.5295-13.8691l.4933-172.9267-23.53,3.29C382.8921,313.6114,382.8149,313.6381,382.7345,313.6538Z"
        fill="none"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <path
        d="M426.702,483.4531c-.0213,7.4058,6.2749,13.4816,13.9912,13.502l55.3328.1455c7.7171.02,14.0472-6.0226,14.0685-13.4284L510.63,295.75,427.204,307.4117Z"
        fill="none"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <path
        d="M176.7627,400.5554l-3.072,4.3109-3.5308,4.9568-12.4993,17.5432-.9843,1.3815-4.28,6.0072-10.9736,15.4023L114.932,487.34a11.6149,11.6149,0,0,0,11.541,9.5987l59.8935.1575A11.5571,11.5571,0,0,0,198.1479,485.85l.331-115.7758-11.857,16.6429Z"
        fill="none"
        strokeMiterlimit="10"
        strokeWidth="10"
      />
      <path
        d="M218.8356,341.5591l-.4019,140.8527c-.0237,7.9809,6.7619,14.5285,15.0764,14.55l53.1553.14c8.3153.0218,15.1379-6.49,15.1607-14.4712l.62-217.5179-17.72-12.3171Z"
        fill="none"
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
      />
      <ellipse cx="152.8389" cy="120.0486" rx="53.0747" ry="52.8594" />
      <path d="M152.8384,197.9749c-58.2333,0-105.44,25.8729-105.44,57.7887V511.849c0,15.3522,18.43,27.9129,40.9573,27.9129H217.3222c22.526,0,40.9573-12.5607,40.9573-27.9129V255.7636C258.2795,223.8478,211.0727,197.9749,152.8384,197.9749Z" />
      <rect
        x="344.6438"
        y="61.5487"
        width="79.8902"
        height="105.1359"
        rx="8.8547"
        ry="8.8547"
        transform="translate(498.7056 -270.4723) rotate(90)"
        fill="none"
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
        strokeMiterlimit="10"
        strokeWidth="10"
      />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={600} ChildSVG={SVGEmployee} />;
};

const IconClipboard = (props) => {
  const SVGClipboard = () => (
    <Fragment>
      <path d="M148.2345,30.9468l-12.8984-.0309-1.51.0309V45.8991c0,.4115-.4936.7723-1.057.7723H47.231c-.5634,0-1.057-.3608-1.057-.7723V30.9159l-14.4085.0309c-7.76,0-14.0734,5.6887-14.0734,12.6816v116.98c0,6.9929,6.3131,12.6816,14.0734,12.6816h116.469c7.76,0,14.0734-5.6887,14.0734-12.6816V43.6284C162.3079,36.6355,155.9948,30.9468,148.2345,30.9468ZM47.231,54.16h85.538c5.0192,0,9.1024-3.7061,9.1024-8.2612V38.4358h6.3631c3.3242,0,6.028,2.33,6.028,5.1926v116.98c0,2.863-2.7038,5.1927-6.028,5.1927H31.7655c-3.3242,0-6.028-2.33-6.028-5.1927V43.6284c0-2.863,2.7038-5.1926,6.028-5.1926h6.3621v7.4633C38.1276,50.4542,42.2118,54.16,47.231,54.16Z" />
      <g>
        <path d="M126.0088,38.0952H53.9912V24.812l15.0117.0015c.4805-6.628,10.4688-12.1348,22.2383-12.1348S112.999,18.1855,113.48,24.8135l12.5293-.0015Zm-71.0176-1h70.0176V25.812l-12.5108.0015v-.5c0-6.3067-9.7343-11.6348-21.2568-11.6348S69.9844,19.0068,69.9844,25.3135v.5L54.9912,25.812Z" />
        <g>
          <path d="M126.0747,20.8433h-9.003a13.244,13.244,0,0,0-1.49-2.5634c-4.1964-5.6994-13.4027-9.57-24.341-9.57s-20.1438,3.87-24.3406,9.57a13.2389,13.2389,0,0,0-1.4895,2.5634H53.9252a4.2393,4.2393,0,0,0-4.4594,3.9653v13.29a4.239,4.239,0,0,0,4.4594,3.9649h72.15a4.2389,4.2389,0,0,0,4.4594-3.9649v-13.29A4.2392,4.2392,0,0,0,126.0747,20.8433Zm-.566,16.752H54.4912V25.3119h9.9682v.0014h5.0254c0-6.5777,9.9633-12.1347,21.7564-12.1347s21.7572,5.557,21.7572,12.1347h5.0254v-.0014h7.4849Z" />
          <path d="M126.0752,42.564h-72.15a4.7369,4.7369,0,0,1-4.959-4.4649V24.8086a4.7369,4.7369,0,0,1,4.959-4.4653H65.0879a13.964,13.964,0,0,1,1.41-2.36C70.9375,11.9551,80.4189,8.21,91.2412,8.21s20.3047,3.7451,24.7432,9.7734a13.8994,13.8994,0,0,1,1.41,2.36h8.6807a4.7369,4.7369,0,0,1,4.959,4.4653V38.0991A4.7369,4.7369,0,0,1,126.0752,42.564Zm-72.15-21.2207a3.7415,3.7415,0,0,0-3.959,3.4653V38.0991a3.7412,3.7412,0,0,0,3.959,3.4649h72.15a3.7412,3.7412,0,0,0,3.959-3.4649V24.8086a3.7415,3.7415,0,0,0-3.959-3.4653h-9.332l-.1309-.3008a12.7649,12.7649,0,0,0-1.4326-2.4663C110.9258,12.7988,101.7529,9.21,91.2412,9.21s-19.6836,3.5888-23.9385,9.3662a12.8394,12.8394,0,0,0-1.4336,2.4668l-.1308.3Zm72.084,16.7519H53.9912V24.812l15.0117.0015c.4805-6.628,10.4688-12.1348,22.2383-12.1348S112.999,18.1855,113.48,24.8135l12.5293-.0015Zm-71.0176-1h70.0176V25.812l-12.5108.0015v-.5c0-6.3067-9.7343-11.6348-21.2568-11.6348S69.9844,19.0068,69.9844,25.3135v.5L54.9912,25.812Z" />
        </g>
      </g>
      <path d="M63.5312,133.5221a3.7052,3.7052,0,0,1,3.6944,3.6943V149.558a3.7052,3.7052,0,0,1-3.6944,3.6944H48.6349a3.7053,3.7053,0,0,1-3.6943-3.6944V137.2164a3.7052,3.7052,0,0,1,3.6943-3.6943H63.5312m0-3H48.6349a6.7019,6.7019,0,0,0-6.6943,6.6943V149.558a6.702,6.702,0,0,0,6.6943,6.6944H63.5312a6.702,6.702,0,0,0,6.6944-6.6944V137.2164a6.702,6.702,0,0,0-6.6944-6.6943Z" />
      <g>
        <path d="M63.5312,63.6484a3.7052,3.7052,0,0,1,3.6944,3.6944V79.6843a3.7052,3.7052,0,0,1-3.6944,3.6944H48.6349a3.7053,3.7053,0,0,1-3.6943-3.6944V67.3428a3.7053,3.7053,0,0,1,3.6943-3.6944H63.5312m0-3H48.6349a6.702,6.702,0,0,0-6.6943,6.6944V79.6843a6.702,6.702,0,0,0,6.6943,6.6944H63.5312a6.702,6.702,0,0,0,6.6944-6.6944V67.3428a6.702,6.702,0,0,0-6.6944-6.6944Z" />
        <path d="M63.5312,98.866a3.7051,3.7051,0,0,1,3.6944,3.6943v12.3416a3.7052,3.7052,0,0,1-3.6944,3.6943H48.6349a3.7052,3.7052,0,0,1-3.6943-3.6943V102.56a3.7052,3.7052,0,0,1,3.6943-3.6943H63.5312m0-3H48.6349a6.7019,6.7019,0,0,0-6.6943,6.6943v12.3416a6.7019,6.7019,0,0,0,6.6943,6.6943H63.5312a6.702,6.702,0,0,0,6.6944-6.6943V102.56a6.7019,6.7019,0,0,0-6.6944-6.6943Z" />
      </g>
      <line
        className="icon-stroke"
        x1="84.1022"
        y1="74.0749"
        x2="138.6835"
        y2="74.0749"
        strokeMiterlimit="10"
        strokeWidth="4"
      />
      <line
        className="icon-stroke"
        x1="84.1022"
        y1="108.7311"
        x2="138.6835"
        y2="108.7311"
        strokeMiterlimit="10"
        strokeWidth="4"
      />
      <line
        className="icon-stroke"
        x1="84.1022"
        y1="143.3872"
        x2="138.6835"
        y2="143.3872"
        strokeMiterlimit="10"
        strokeWidth="4"
      />
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={180} ChildSVG={SVGClipboard} />
  );
};

const IconExpend = (props) => {
  const SVGExpend = () => (
    <Fragment>
      <path d="M21.6374,144.0857l-7.84,11h148.94a3.698,3.698,0,0,1,3.69,3.68v1.78a3.6916,3.6916,0,0,1-3.69,3.68H5.6474a.41.41,0,0,1-.11-.01h-.12a3.4979,3.4979,0,0,1-2.25-.84l-.99-.85a4.3453,4.3453,0,0,1-.65-5.72l23-32.28a27.7079,27.7079,0,0,1-4.85-4.08q-7.89-8.28-9.04-21.8a1.5483,1.5483,0,0,1,1.58-1.64h7.3a1.5723,1.5723,0,0,1,1.56,1.34,21.1758,21.1758,0,0,0,6.5,12.77,18.6606,18.6606,0,0,0,4.36,3.01l1.8-2.53,4.79-6.73,4.42-6.2,9.09-12.75,1.39-1.96a28.8348,28.8348,0,0,0-10.26-5.6l-10.01-3.55q-10.59-3.69-15.41-10.52-4.8-6.825-4.81-18.2,0-13.59,7.6-21.97a24.55,24.55,0,0,1,11.8-7.32v-4.48a3.0662,3.0662,0,0,1,3.06-3.06h9.71a3.0728,3.0728,0,0,1,3.06,3.06v4.49a24.8,24.8,0,0,1,11.27,7.2q7.155,7.755,8.12,19.6a1.4892,1.4892,0,0,1-1.5,1.59h-6.89a1.5123,1.5123,0,0,1-1.48-1.28,20.4049,20.4049,0,0,0-5.52-11.53,16.3619,16.3619,0,0,0-11.98-4.61q-7.7848,0-12.51,4.87-4.74,4.875-4.74,13a14.7773,14.7773,0,0,0,3.49,10.19c2.33,2.61,6.17,4.84,11.55,6.72l8.16,2.95c6.27,2.13,11.14,4.84,14.66,8.1l1.12-1.57,1.25-1.74,1.15-1.63,2.21-3.09,3.13-4.39,5.88-8.26a3.5346,3.5346,0,0,1,5.24-.71l.76.64.03.03,30.32,21.95,43.27-6.31-1.12-9.18a.7834.7834,0,0,1,1.28-.69l14.4,12.01a.7889.7889,0,0,1,.14,1.05l-11.02,15.72a.7876.7876,0,0,1-1.42-.36l-1.11-9.1-44.87,6.53-.04.01a2.997,2.997,0,0,1-2.6-.48l-29.26-21.2-5.11,7.16-2.96,4.16-3.13,4.38-.75,1.06-1.49,2.08-6.55,9.21-1.07,1.49-7.95,11.17-1.91,2.67-3.83,5.38-3.18,4.47-1,1.39-1.14,1.6-4.03,5.66-.32.45-1.38,1.94-3.55,4.97Z" />
      <path d="M81.5653,53.98l.0311.0152Z" />
      <path d="M82.0529,54.229c.03.0173.0591.0372.0889.055C82.112,54.2661,82.0832,54.2463,82.0529,54.229Z" />
      <path d="M111.2355,90.2342l-.2917.0425c.07-.0114.1394-.007.2092-.0211C111.1808,90.25,111.2077,90.24,111.2355,90.2342Z" />
      <g>
        <path
          d="M97.3434,149.3454a3.75,3.75,0,0,1-2.6094-1.0473,3.3787,3.3787,0,0,1-1.0595-2.4531l.1816-63.8038,12.8233,8.9126a7.2892,7.2892,0,0,0,4.1787,1.3155,7.44,7.44,0,0,0,1.4218-.1377l.1026-.0244,6.3789-.8892-.1563,54.6919a3.5962,3.5962,0,0,1-3.68,3.4819Z"
          fill="#de4c4a"
        />
        <path d="M94.851,83.95l11.2568,7.824a8.2826,8.2826,0,0,0,4.75,1.4949,8.4369,8.4369,0,0,0,1.6125-.156c.0252-.0049.05-.01.075-.0159l5.2124-.7287-.1528,53.5387a2.5973,2.5973,0,0,1-2.6866,2.4846l-17.572-.0462a2.754,2.754,0,0,1-1.9175-.7671,2.3873,2.3873,0,0,1-.7544-1.7307L94.851,83.95m-1.989-3.8182-.1878,65.71a4.6,4.6,0,0,0,4.6665,4.5035l17.5721.0461h.0129a4.6023,4.6023,0,0,0,4.679-4.4789l.1594-55.8443-7.5989,1.0622c-.0259.0054-.0508.014-.0769.0191a6.4221,6.4221,0,0,1-1.2307.1192,6.2927,6.2927,0,0,1-3.6079-1.1368l-14.3877-10Z" />
      </g>
      <g>
        <path
          d="M130.8083,149.3445a3.6,3.6,0,0,1-2.5049-1.0049,3.2376,3.2376,0,0,1-1.0166-2.3521l.1592-55.9834,24.9414-3.4858-.17,59.5342a3.449,3.449,0,0,1-3.53,3.3393Z"
          fill="#de4c4a"
        />
        <path d="M151.3839,87.6681l-.1662,58.3812a2.4518,2.4518,0,0,1-2.5381,2.3424l-17.8689-.047a2.6039,2.6039,0,0,1-1.8127-.7249,2.2487,2.2487,0,0,1-.711-1.63l.1573-55.1153,22.94-3.2067m2.0066-2.3-26.9414,3.766-.1621,56.85a4.4543,4.4543,0,0,0,4.5183,4.36l17.8692.047h.0124a4.4564,4.4564,0,0,0,4.5308-4.3365l.1728-60.687Z" />
      </g>
      <path d="M82.4655,53.7906c.0422.0242.083.0518.1247.0771C82.5485,53.8424,82.5077,53.8148,82.4655,53.7906Z" />
      <path d="M81.923,53.515c.0342.0154.0676.033.1016.0491C81.99,53.5482,81.9574,53.53,81.923,53.515Z" />
      <path d="M80.8222,62.1506c-.075-.0362-.15-.0652-.2268-.0943C80.6713,62.0869,80.7477,62.1139,80.8222,62.1506Z" />
      <g>
        <path
          d="M29.3356,149.34a2.7916,2.7916,0,0,1-2.6543-1.8867L51.5768,112.51l-.0986,34.2456a2.7252,2.7252,0,0,1-2.793,2.6348Z"
          fill="#de4c4a"
        />
        <path d="M50.5675,115.65l-.0888,31.1034a1.7278,1.7278,0,0,1-1.7993,1.6373l-19.3418-.0508a1.8268,1.8268,0,0,1-1.5047-.78l7.9561-11.1671,3.5437-4.974,1.3821-1.94.3178-.4461,4.0367-5.6656,1.14-1.6.9925-1.3924,3.1838-4.4689.1821-.2558m2.0181-6.2793-3.8291,5.3747-3.1838,4.4688-.9922,1.3922-1.14,1.6007-4.0366,5.6653-.3178.4462-1.3821,1.94L34.16,135.232,25.6051,147.24a3.7511,3.7511,0,0,0,3.7271,3.1l19.3418.0508h.01a3.7319,3.7319,0,0,0,3.7945-3.6318l.1069-37.3883Z" />
      </g>
      <g>
        <path
          d="M63.901,149.3469a3.9521,3.9521,0,0,1-2.7519-1.105,3.5669,3.5669,0,0,1-1.1192-2.5908l.129-45.1572L80.6637,72.8713l4.4952,3.125-.1983,69.72a3.7959,3.7959,0,0,1-3.8828,3.6763Z"
          fill="#de4c4a"
        />
        <path d="M80.8883,74.2455l3.2691,2.2723L83.96,145.7132a2.7969,2.7969,0,0,1-2.8906,2.6789l-17.1658-.0451a2.96,2.96,0,0,1-2.06-.8247,2.577,2.577,0,0,1-.8135-1.8685l.1279-44.8284,19.7307-26.58m-.45-2.7487L59.16,100.1616l-.13,45.4865a4.8,4.8,0,0,0,4.8687,4.6989l17.1657.0451h.0135a4.8021,4.8021,0,0,0,4.8825-4.6733l.2-70.2445-5.7224-3.9776Z" />
      </g>
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={170}
      viewbox_height={165}
      ChildSVG={SVGExpend}
    />
  );
};

const IconPeople = (props) => {
  const SVGPeople = () => (
    <Fragment>
      <rect
        x="80.4538"
        y="8.8568"
        width="9.0923"
        height="156.1432"
        rx="1.706"
        ry="1.706"
      />
      <ellipse cx="39.6391" cy="28.7388" rx="17.1624" ry="17.0928" />
      <path d="M39.639,53.9373c-18.8305,0-34.0955,8.3663-34.0955,18.6867v82.8086c0,4.9643,5.96,9.026,13.2441,9.026H60.4907c7.2841,0,13.2441-4.0617,13.2441-9.026V72.624C73.7348,62.3036,58.47,53.9373,39.639,53.9373Z" />
      <g>
        <rect
          x="96.5799"
          y="12.904"
          width="31.9971"
          height="23.8335"
          rx="1.8633"
          ry="1.8633"
          fill="#da3a38"
        />
        <path d="M126.7137,13.9038a.8748.8748,0,0,1,.8633.8633V34.874a.8748.8748,0,0,1-.8633.8633h-28.27a.875.875,0,0,1-.8635-.8633V14.7671a.875.875,0,0,1,.8635-.8633h28.27m0-2h-28.27A2.8718,2.8718,0,0,0,95.58,14.7671V34.874a2.8718,2.8718,0,0,0,2.8635,2.8633h28.27a2.8716,2.8716,0,0,0,2.8633-2.8633V14.7671a2.8717,2.8717,0,0,0-2.8633-2.8633Z" />
      </g>
      <g>
        <path
          d="M99.4461,54.6555h54.2622a2.8667,2.8667,0,0,1,2.8667,2.8667V75.6228a2.8662,2.8662,0,0,1-2.8662,2.8662H99.4461A2.8662,2.8662,0,0,1,96.58,75.6228V57.5217A2.8662,2.8662,0,0,1,99.4461,54.6555Z"
          fill="#da3a38"
        />
        <path d="M153.7086,55.6557a1.8686,1.8686,0,0,1,1.8664,1.8665v18.1a1.8686,1.8686,0,0,1-1.8664,1.8665H99.4466A1.8687,1.8687,0,0,1,97.58,75.6227v-18.1a1.8687,1.8687,0,0,1,1.8667-1.8665h54.262m0-2H99.4466A3.8779,3.8779,0,0,0,95.58,57.5222v18.1a3.8779,3.8779,0,0,0,3.8667,3.8665h54.262a3.8779,3.8779,0,0,0,3.8664-3.8665v-18.1a3.8779,3.8779,0,0,0-3.8664-3.8665Z" />
      </g>
      <g>
        <path
          d="M99.1434,96.4075h45.5347a2.564,2.564,0,0,1,2.564,2.564v18.7061a2.5635,2.5635,0,0,1-2.5635,2.5635H99.1434a2.5635,2.5635,0,0,1-2.5635-2.5635V98.9709A2.5635,2.5635,0,0,1,99.1434,96.4075Z"
          fill="#da3a38"
        />
        <path d="M144.6788,97.4075a1.5654,1.5654,0,0,1,1.5637,1.5637v18.7062a1.5654,1.5654,0,0,1-1.5637,1.5637H99.1436a1.5654,1.5654,0,0,1-1.5637-1.5637V98.9712a1.5654,1.5654,0,0,1,1.5637-1.5637h45.5352m0-2H99.1436A3.5743,3.5743,0,0,0,95.58,98.9712v18.7062a3.5743,3.5743,0,0,0,3.5637,3.5637h45.5352a3.5743,3.5743,0,0,0,3.5637-3.5637V98.9712a3.5743,3.5743,0,0,0-3.5637-3.5637Z" />
      </g>
      <g>
        <rect
          x="96.5799"
          y="138.1594"
          width="69.3281"
          height="23.8335"
          rx="3.1475"
          ry="3.1475"
          fill="#da3a38"
        />
        <path d="M162.76,139.1594a2.15,2.15,0,0,1,2.1475,2.1474v17.5387a2.15,2.15,0,0,1-2.1475,2.1474H99.7274a2.15,2.15,0,0,1-2.1475-2.1474V141.3068a2.15,2.15,0,0,1,2.1475-2.1474H162.76m0-2H99.7274a4.16,4.16,0,0,0-4.1475,4.1474v17.5387a4.16,4.16,0,0,0,4.1475,4.1474H162.76a4.16,4.16,0,0,0,4.1475-4.1474V141.3068a4.16,4.16,0,0,0-4.1475-4.1474Z" />
      </g>
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={170}
      viewbox_height={165}
      ChildSVG={SVGPeople}
    />
  );
};

const IconResults = (props) => {
  const SVGResults = () => (
    <Fragment>
      <path d="M143.2345,22.4468l-12.8984-.0309-1.51.0309V37.3991c0,.4115-.4936.7723-1.057.7723H42.231c-.5634,0-1.057-.3608-1.057-.7723V22.4159l-14.4085.0309c-7.76,0-14.0734,5.6887-14.0734,12.6816v116.98c0,6.9929,6.3131,12.6816,14.0734,12.6816h116.469c7.76,0,14.0734-5.6887,14.0734-12.6816V35.1284C157.3079,28.1355,150.9948,22.4468,143.2345,22.4468ZM42.231,45.66h85.538c5.0192,0,9.1024-3.7061,9.1024-8.2612V29.9358h6.3631c3.3242,0,6.028,2.33,6.028,5.1926v116.98c0,2.863-2.7038,5.1927-6.028,5.1927H26.7655c-3.3242,0-6.028-2.33-6.028-5.1927V35.1284c0-2.863,2.7038-5.1926,6.028-5.1926h6.3621v7.4633C33.1276,41.9542,37.2118,45.66,42.231,45.66Z" />
      <g>
        <path
          d="M113.0238,16.8133h-5.0254c0-6.5777-9.9634-12.1347-21.7572-12.1347s-21.7564,5.557-21.7564,12.1347H59.4594v-.0014H49.4912V29.0953h71.0175V16.8119h-7.4849Z"
          fill="none"
          stroke="#fff"
          strokeMiterlimit="10"
        />
        <path
          d="M121.0747,12.3433h-9.003a13.244,13.244,0,0,0-1.49-2.5634C106.3858,4.0805,97.18.21,86.2412.21s-20.1438,3.87-24.3406,9.57a13.2389,13.2389,0,0,0-1.4895,2.5634H48.9252a4.2393,4.2393,0,0,0-4.4594,3.9653v13.29a4.239,4.239,0,0,0,4.4594,3.9649h72.15a4.2389,4.2389,0,0,0,4.4594-3.9649v-13.29A4.2392,4.2392,0,0,0,121.0747,12.3433Zm-.566,16.752H49.4912V16.8119h9.9682v.0014h5.0254c0-6.5777,9.9633-12.1347,21.7564-12.1347s21.7572,5.557,21.7572,12.1347h5.0254v-.0014h7.4849Z"
          stroke="#fff"
          strokeMiterlimit="10"
        />
      </g>
      <path d="M58.5313,125.0221a3.7051,3.7051,0,0,1,3.6943,3.6943V141.058a3.7051,3.7051,0,0,1-3.6943,3.6944H43.635a3.7052,3.7052,0,0,1-3.6943-3.6944V128.7164a3.7052,3.7052,0,0,1,3.6943-3.6943H58.5313m0-3H43.635a6.702,6.702,0,0,0-6.6943,6.6943V141.058a6.702,6.702,0,0,0,6.6943,6.6944H58.5313a6.702,6.702,0,0,0,6.6943-6.6944V128.7164a6.7019,6.7019,0,0,0-6.6943-6.6943Z" />
      <g>
        <g>
          <rect
            x="38.441"
            y="53.6487"
            width="25.2842"
            height="22.73"
            rx="5.1943"
            ry="5.1943"
            fill="#da3a38"
          />
          <path d="M58.5313,55.1484a3.7051,3.7051,0,0,1,3.6943,3.6944V71.1843a3.7051,3.7051,0,0,1-3.6943,3.6944H43.635a3.7052,3.7052,0,0,1-3.6943-3.6944V58.8428a3.7052,3.7052,0,0,1,3.6943-3.6944H58.5313m0-3H43.635a6.702,6.702,0,0,0-6.6943,6.6944V71.1843a6.702,6.702,0,0,0,6.6943,6.6944H58.5313a6.702,6.702,0,0,0,6.6943-6.6944V58.8428a6.702,6.702,0,0,0-6.6943-6.6944Z" />
        </g>
        <g>
          <rect
            x="38.441"
            y="88.8659"
            width="25.2842"
            height="22.7305"
            rx="5.1943"
            ry="5.1943"
            fill="#da3a38"
          />
          <path d="M58.5313,90.366A3.7051,3.7051,0,0,1,62.2256,94.06v12.3416a3.7051,3.7051,0,0,1-3.6943,3.6943H43.635a3.7051,3.7051,0,0,1-3.6943-3.6943V94.06A3.7051,3.7051,0,0,1,43.635,90.366H58.5313m0-3H43.635A6.7019,6.7019,0,0,0,36.9407,94.06v12.3416a6.702,6.702,0,0,0,6.6943,6.6943H58.5313a6.7019,6.7019,0,0,0,6.6943-6.6943V94.06a6.7019,6.7019,0,0,0-6.6943-6.6943Z" />
        </g>
      </g>
      <line
        x1="79.1022"
        y1="65.5749"
        x2="133.6835"
        y2="65.5749"
        fill="none"
        stroke="#fff"
        strokeMiterlimit="10"
        strokeWidth="4"
      />
      <line
        x1="79.1022"
        y1="100.2311"
        x2="133.6835"
        y2="100.2311"
        fill="none"
        stroke="#fff"
        strokeMiterlimit="10"
        strokeWidth="4"
      />
      <line
        x1="79.1022"
        y1="134.8872"
        x2="133.6835"
        y2="134.8872"
        fill="none"
        stroke="#fff"
        strokeMiterlimit="10"
        strokeWidth="4"
      />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={170}
      viewbox_height={165}
      ChildSVG={SVGResults}
    />
  );
};

const IconFlagLine = (props) => {
  const SVGFlagLine = () => (
    <Fragment>
      <path d="M583.105,52.495l1.06,3-10.67-1.76c-1.31-.3-2.23-.3-2.26.66l.44,11.16h-3.22l.44-11.12c0-1.1-.92-1.07-3.07-.67l-9.87,1.73,1.28-3c.44-1.13.55-1.9-.44-2.67l-11.69-8.69,2.16-1.15c.62-.43.65-.9.33-1.86l-2.2-6.5,5.63,1.1c1.57.33,2,0,2.41-.8l1.57-2.94,5.55,5.73c1,1.06,2.38.37,1.94-1.17l-2.66-12,4.12,2.16c.66.37,1.36.47,1.76-.23l-.07.17,4.42-8.2,4.38,7.9c.55.83,1,.76,1.86.36l3.77-1.7-2.45,11c-.51,2.16.84,2.8,2.3,1.33l5.34-5.19,1.43,3c.47.9,1.2.77,2.15.6l5.56-1.06-1.87,6.39v.14c-.22.83-.66,1.53.36,1.93l2,.9-11.44,8.82C582.265,50.925,582.665,51.265,583.105,52.495Z" />
      <g>
        <line
          x1="0.2197"
          y1="40.5"
          x2="525.9126"
          y2="40.5"
          fill="none"
          strokeMiterlimit="10"
          strokeWidth="2.42"
        />
        <line
          x1="614.1473"
          y1="40.5"
          x2="1139.8403"
          y2="40.5"
          fill="none"
          strokeMiterlimit="10"
          strokeWidth="2.42"
        />
      </g>
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={1140}
      viewbox_height={81}
      ChildSVG={SVGFlagLine}
    />
  );
};

const IconBaselineCloud = (props) => {
  const SVGBaselineCloud = () => (
    <Fragment>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={24} ChildSVG={SVGBaselineCloud} />
  );
};

const IconGit = (props) => {
  const SVGGit = () => (
    <Fragment>
      <path d="M18.8 221.7c0 25.3 16.2 60 41.5 68.5v1c-18.8 8.3-24 50.6 1 65.8v1C34 367 16 384.3 16 414.2c0 51.5 48.8 65.8 91.5 65.8 52 0 90.7-18.7 90.7-76 0-70.5-101-44.5-101-82.8 0-13.5 7.2-18.7 19.7-21.3 41.5-7.7 67.5-40 67.5-82.2 0-7.3-1.5-14.2-4-21 6.7-1.5 13.2-3.3 19.7-5.5v-50.5c-17.2 6.8-35.7 11.8-54.5 11.8-53.8-31-126.8 1.3-126.8 69.2zm87.7 163.8c17 0 41.2 3 41.2 25 0 21.8-19.5 26.3-37.7 26.3-17.3 0-43.3-2.7-43.3-25.2.1-22.3 22.1-26.1 39.8-26.1zM103.3 256c-22 0-31.3-13-31.3-33.8 0-49.3 61-48.8 61-.5 0 20.3-8 34.3-29.7 34.3zM432 305.5v49c-13.3 7.3-30.5 9.8-45.5 9.8-53.5 0-59.8-42.2-59.8-85.7v-87.7h.5v-1c-7 0-7.3-1.6-24 1v-47.5h24c0-22.3.3-31-1.5-41.2h56.7c-2 13.8-1.5 27.5-1.5 41.2h51v47.5s-19.3-1-51-1V281c0 14.8 3.3 32.8 21.8 32.8 9.8 0 21.3-2.8 29.3-8.3zM286 68.7c0 18.7-14.5 36.2-33.8 36.2-19.8 0-34.5-17.2-34.5-36.2 0-19.3 14.5-36.7 34.5-36.7C272 32 286 50 286 68.7zm-6.2 74.5c-1.8 14.6-1.6 199.8 0 217.8h-55.5c1.6-18.1 1.8-203 0-217.8h55.5z" />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={448}
      viewbox_height={512}
      ChildSVG={SVGGit}
    />
  );
};

const IconGraphQL = (props) => {
  const SVGGraphQL = () => (
    <Fragment>
      <path d="M57.468 302.66l-14.376-8.3 160.15-277.38 14.376 8.3z" />
      <path d="M39.8 272.2h320.3v16.6H39.8z" />
      <path d="M206.348 374.026l-160.21-92.5 8.3-14.376 160.21 92.5zM345.522 132.947l-160.21-92.5 8.3-14.376 160.21 92.5z" />
      <path d="M54.482 132.883l-8.3-14.375 160.21-92.5 8.3 14.376z" />
      <path d="M342.568 302.663l-160.15-277.38 14.376-8.3 160.15 277.38zM52.5 107.5h16.6v185H52.5zM330.9 107.5h16.6v185h-16.6z" />
      <path d="M203.522 367l-7.25-12.558 139.34-80.45 7.25 12.557z" />
      <path d="M369.5 297.9c-9.6 16.7-31 22.4-47.7 12.8-16.7-9.6-22.4-31-12.8-47.7 9.6-16.7 31-22.4 47.7-12.8 16.8 9.7 22.5 31 12.8 47.7M90.9 137c-9.6 16.7-31 22.4-47.7 12.8-16.7-9.6-22.4-31-12.8-47.7 9.6-16.7 31-22.4 47.7-12.8 16.7 9.7 22.4 31 12.8 47.7M30.5 297.9c-9.6-16.7-3.9-38 12.8-47.7 16.7-9.6 38-3.9 47.7 12.8 9.6 16.7 3.9 38-12.8 47.7-16.8 9.6-38.1 3.9-47.7-12.8M309.1 137c-9.6-16.7-3.9-38 12.8-47.7 16.7-9.6 38-3.9 47.7 12.8 9.6 16.7 3.9 38-12.8 47.7-16.7 9.6-38.1 3.9-47.7-12.8M200 395.8c-19.3 0-34.9-15.6-34.9-34.9 0-19.3 15.6-34.9 34.9-34.9 19.3 0 34.9 15.6 34.9 34.9 0 19.2-15.6 34.9-34.9 34.9M200 74c-19.3 0-34.9-15.6-34.9-34.9 0-19.3 15.6-34.9 34.9-34.9 19.3 0 34.9 15.6 34.9 34.9 0 19.3-15.6 34.9-34.9 34.9" />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={400} ChildSVG={SVGGraphQL} />;
};

const IconHTML = (props) => {
  const SVGHTML = () => (
    <Fragment>
      <path d="M0 32l34.9 395.8L191.5 480l157.6-52.2L384 32H0zm308.2 127.9H124.4l4.1 49.4h175.6l-13.6 148.4-97.9 27v.3h-1.1l-98.7-27.3-6-75.8h47.7L138 320l53.5 14.5 53.7-14.5 6-62.2H84.3L71.5 112.2h241.1l-4.4 47.7z" />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={384}
      viewbox_height={512}
      ChildSVG={SVGHTML}
    />
  );
};

const IconNodeJS = (props) => {
  const SVGNodeJS = () => (
    <Fragment>
      <path d="M224 508c-6.7 0-13.5-1.8-19.4-5.2l-61.7-36.5c-9.2-5.2-4.7-7-1.7-8 12.3-4.3 14.8-5.2 27.9-12.7 1.4-.8 3.2-.5 4.6.4l47.4 28.1c1.7 1 4.1 1 5.7 0l184.7-106.6c1.7-1 2.8-3 2.8-5V149.3c0-2.1-1.1-4-2.9-5.1L226.8 37.7c-1.7-1-4-1-5.7 0L36.6 144.3c-1.8 1-2.9 3-2.9 5.1v213.1c0 2 1.1 4 2.9 4.9l50.6 29.2c27.5 13.7 44.3-2.4 44.3-18.7V167.5c0-3 2.4-5.3 5.4-5.3h23.4c2.9 0 5.4 2.3 5.4 5.3V378c0 36.6-20 57.6-54.7 57.6-10.7 0-19.1 0-42.5-11.6l-48.4-27.9C8.1 389.2.7 376.3.7 362.4V149.3c0-13.8 7.4-26.8 19.4-33.7L204.6 9c11.7-6.6 27.2-6.6 38.8 0l184.7 106.7c12 6.9 19.4 19.8 19.4 33.7v213.1c0 13.8-7.4 26.7-19.4 33.7L243.4 502.8c-5.9 3.4-12.6 5.2-19.4 5.2zm149.1-210.1c0-39.9-27-50.5-83.7-58-57.4-7.6-63.2-11.5-63.2-24.9 0-11.1 4.9-25.9 47.4-25.9 37.9 0 51.9 8.2 57.7 33.8.5 2.4 2.7 4.2 5.2 4.2h24c1.5 0 2.9-.6 3.9-1.7s1.5-2.6 1.4-4.1c-3.7-44.1-33-64.6-92.2-64.6-52.7 0-84.1 22.2-84.1 59.5 0 40.4 31.3 51.6 81.8 56.6 60.5 5.9 65.2 14.8 65.2 26.7 0 20.6-16.6 29.4-55.5 29.4-48.9 0-59.6-12.3-63.2-36.6-.4-2.6-2.6-4.5-5.3-4.5h-23.9c-3 0-5.3 2.4-5.3 5.3 0 31.1 16.9 68.2 97.8 68.2 58.4-.1 92-23.2 92-63.4z" />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={448}
      viewbox_height={512}
      ChildSVG={SVGNodeJS}
    />
  );
};

const IconPython = (props) => {
  const SVGPython = () => (
    <Fragment>
      <path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4.1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8.1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3.1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z" />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={448}
      viewbox_height={512}
      ChildSVG={SVGPython}
    />
  );
};

const IconReact = (props) => {
  const SVGReact = () => (
    <Fragment>
      <path d="M418.2 177.2c-5.4-1.8-10.8-3.5-16.2-5.1.9-3.7 1.7-7.4 2.5-11.1 12.3-59.6 4.2-107.5-23.1-123.3-26.3-15.1-69.2.6-112.6 38.4-4.3 3.7-8.5 7.6-12.5 11.5-2.7-2.6-5.5-5.2-8.3-7.7-45.5-40.4-91.1-57.4-118.4-41.5-26.2 15.2-34 60.3-23 116.7 1.1 5.6 2.3 11.1 3.7 16.7-6.4 1.8-12.7 3.8-18.6 5.9C38.3 196.2 0 225.4 0 255.6c0 31.2 40.8 62.5 96.3 81.5 4.5 1.5 9 3 13.6 4.3-1.5 6-2.8 11.9-4 18-10.5 55.5-2.3 99.5 23.9 114.6 27 15.6 72.4-.4 116.6-39.1 3.5-3.1 7-6.3 10.5-9.7 4.4 4.3 9 8.4 13.6 12.4 42.8 36.8 85.1 51.7 111.2 36.6 27-15.6 35.8-62.9 24.4-120.5-.9-4.4-1.9-8.9-3-13.5 3.2-.9 6.3-1.9 9.4-2.9 57.7-19.1 99.5-50 99.5-81.7 0-30.3-39.4-59.7-93.8-78.4zM282.9 92.3c37.2-32.4 71.9-45.1 87.7-36 16.9 9.7 23.4 48.9 12.8 100.4-.7 3.4-1.4 6.7-2.3 10-22.2-5-44.7-8.6-67.3-10.6-13-18.6-27.2-36.4-42.6-53.1 3.9-3.7 7.7-7.2 11.7-10.7zM167.2 307.5c5.1 8.7 10.3 17.4 15.8 25.9-15.6-1.7-31.1-4.2-46.4-7.5 4.4-14.4 9.9-29.3 16.3-44.5 4.6 8.8 9.3 17.5 14.3 26.1zm-30.3-120.3c14.4-3.2 29.7-5.8 45.6-7.8-5.3 8.3-10.5 16.8-15.4 25.4-4.9 8.5-9.7 17.2-14.2 26-6.3-14.9-11.6-29.5-16-43.6zm27.4 68.9c6.6-13.8 13.8-27.3 21.4-40.6s15.8-26.2 24.4-38.9c15-1.1 30.3-1.7 45.9-1.7s31 .6 45.9 1.7c8.5 12.6 16.6 25.5 24.3 38.7s14.9 26.7 21.7 40.4c-6.7 13.8-13.9 27.4-21.6 40.8-7.6 13.3-15.7 26.2-24.2 39-14.9 1.1-30.4 1.6-46.1 1.6s-30.9-.5-45.6-1.4c-8.7-12.7-16.9-25.7-24.6-39s-14.8-26.8-21.5-40.6zm180.6 51.2c5.1-8.8 9.9-17.7 14.6-26.7 6.4 14.5 12 29.2 16.9 44.3-15.5 3.5-31.2 6.2-47 8 5.4-8.4 10.5-17 15.5-25.6zm14.4-76.5c-4.7-8.8-9.5-17.6-14.5-26.2-4.9-8.5-10-16.9-15.3-25.2 16.1 2 31.5 4.7 45.9 8-4.6 14.8-10 29.2-16.1 43.4zM256.2 118.3c10.5 11.4 20.4 23.4 29.6 35.8-19.8-.9-39.7-.9-59.5 0 9.8-12.9 19.9-24.9 29.9-35.8zM140.2 57c16.8-9.8 54.1 4.2 93.4 39 2.5 2.2 5 4.6 7.6 7-15.5 16.7-29.8 34.5-42.9 53.1-22.6 2-45 5.5-67.2 10.4-1.3-5.1-2.4-10.3-3.5-15.5-9.4-48.4-3.2-84.9 12.6-94zm-24.5 263.6c-4.2-1.2-8.3-2.5-12.4-3.9-21.3-6.7-45.5-17.3-63-31.2-10.1-7-16.9-17.8-18.8-29.9 0-18.3 31.6-41.7 77.2-57.6 5.7-2 11.5-3.8 17.3-5.5 6.8 21.7 15 43 24.5 63.6-9.6 20.9-17.9 42.5-24.8 64.5zm116.6 98c-16.5 15.1-35.6 27.1-56.4 35.3-11.1 5.3-23.9 5.8-35.3 1.3-15.9-9.2-22.5-44.5-13.5-92 1.1-5.6 2.3-11.2 3.7-16.7 22.4 4.8 45 8.1 67.9 9.8 13.2 18.7 27.7 36.6 43.2 53.4-3.2 3.1-6.4 6.1-9.6 8.9zm24.5-24.3c-10.2-11-20.4-23.2-30.3-36.3 9.6.4 19.5.6 29.5.6 10.3 0 20.4-.2 30.4-.7-9.2 12.7-19.1 24.8-29.6 36.4zm130.7 30c-.9 12.2-6.9 23.6-16.5 31.3-15.9 9.2-49.8-2.8-86.4-34.2-4.2-3.6-8.4-7.5-12.7-11.5 15.3-16.9 29.4-34.8 42.2-53.6 22.9-1.9 45.7-5.4 68.2-10.5 1 4.1 1.9 8.2 2.7 12.2 4.9 21.6 5.7 44.1 2.5 66.3zm18.2-107.5c-2.8.9-5.6 1.8-8.5 2.6-7-21.8-15.6-43.1-25.5-63.8 9.6-20.4 17.7-41.4 24.5-62.9 5.2 1.5 10.2 3.1 15 4.7 46.6 16 79.3 39.8 79.3 58 0 19.6-34.9 44.9-84.8 61.4zm-149.7-15c25.3 0 45.8-20.5 45.8-45.8s-20.5-45.8-45.8-45.8c-25.3 0-45.8 20.5-45.8 45.8s20.5 45.8 45.8 45.8z" />
    </Fragment>
  );

  return <_IconWrapper {...props} viewbox_width={512} ChildSVG={SVGReact} />;
};

const IconSass = (props) => {
  const SVGSass = () => (
    <Fragment>
      <path d="M301.84 378.92c-.3.6-.6 1.08 0 0zm249.13-87a131.16 131.16 0 0 0-58 13.5c-5.9-11.9-12-22.3-13-30.1-1.2-9.1-2.5-14.5-1.1-25.3s7.7-26.1 7.6-27.2-1.4-6.6-14.3-6.7-24 2.5-25.29 5.9a122.83 122.83 0 0 0-5.3 19.1c-2.3 11.7-25.79 53.5-39.09 75.3-4.4-8.5-8.1-16-8.9-22-1.2-9.1-2.5-14.5-1.1-25.3s7.7-26.1 7.6-27.2-1.4-6.6-14.29-6.7-24 2.5-25.3 5.9-2.7 11.4-5.3 19.1-33.89 77.3-42.08 95.4c-4.2 9.2-7.8 16.6-10.4 21.6-.4.8-.7 1.3-.9 1.7.3-.5.5-1 .5-.8-2.2 4.3-3.5 6.7-3.5 6.7v.1c-1.7 3.2-3.6 6.1-4.5 6.1-.6 0-1.9-8.4.3-19.9 4.7-24.2 15.8-61.8 15.7-63.1-.1-.7 2.1-7.2-7.3-10.7-9.1-3.3-12.4 2.2-13.2 2.2s-1.4 2-1.4 2 10.1-42.4-19.39-42.4c-18.4 0-44 20.2-56.58 38.5-7.9 4.3-25 13.6-43 23.5-6.9 3.8-14 7.7-20.7 11.4-.5-.5-.9-1-1.4-1.5-35.79-38.2-101.87-65.2-99.07-116.5 1-18.7 7.5-67.8 127.07-127.4 98-48.8 176.35-35.4 189.84-5.6 19.4 42.5-41.89 121.6-143.66 133-38.79 4.3-59.18-10.7-64.28-16.3-5.3-5.9-6.1-6.2-8.1-5.1-3.3 1.8-1.2 7 0 10.1 3 7.9 15.5 21.9 36.79 28.9 18.7 6.1 64.18 9.5 119.17-11.8 61.78-23.8 109.87-90.1 95.77-145.6C386.52 18.32 293-.18 204.57 31.22c-52.69 18.7-109.67 48.1-150.66 86.4-48.69 45.6-56.48 85.3-53.28 101.9 11.39 58.9 92.57 97.3 125.06 125.7-1.6.9-3.1 1.7-4.5 2.5-16.29 8.1-78.18 40.5-93.67 74.7-17.5 38.8 2.9 66.6 16.29 70.4 41.79 11.6 84.58-9.3 107.57-43.6s20.2-79.1 9.6-99.5c-.1-.3-.3-.5-.4-.8 4.2-2.5 8.5-5 12.8-7.5 8.29-4.9 16.39-9.4 23.49-13.3-4 10.8-6.9 23.8-8.4 42.6-1.8 22 7.3 50.5 19.1 61.7 5.2 4.9 11.49 5 15.39 5 13.8 0 20-11.4 26.89-25 8.5-16.6 16-35.9 16-35.9s-9.4 52.2 16.3 52.2c9.39 0 18.79-12.1 23-18.3v.1s.2-.4.7-1.2c1-1.5 1.5-2.4 1.5-2.4v-.3c3.8-6.5 12.1-21.4 24.59-46 16.2-31.8 31.69-71.5 31.69-71.5a201.24 201.24 0 0 0 6.2 25.8c2.8 9.5 8.7 19.9 13.4 30-3.8 5.2-6.1 8.2-6.1 8.2a.31.31 0 0 0 .1.2c-3 4-6.4 8.3-9.9 12.5-12.79 15.2-28 32.6-30 37.6-2.4 5.9-1.8 10.3 2.8 13.7 3.4 2.6 9.4 3 15.69 2.5 11.5-.8 19.6-3.6 23.5-5.4a82.2 82.2 0 0 0 20.19-10.6c12.5-9.2 20.1-22.4 19.4-39.8-.4-9.6-3.5-19.2-7.3-28.2 1.1-1.6 2.3-3.3 3.4-5C434.8 301.72 450.1 270 450.1 270a201.24 201.24 0 0 0 6.2 25.8c2.4 8.1 7.09 17 11.39 25.7-18.59 15.1-30.09 32.6-34.09 44.1-7.4 21.3-1.6 30.9 9.3 33.1 4.9 1 11.9-1.3 17.1-3.5a79.46 79.46 0 0 0 21.59-11.1c12.5-9.2 24.59-22.1 23.79-39.6-.3-7.9-2.5-15.8-5.4-23.4 15.7-6.6 36.09-10.2 62.09-7.2 55.68 6.5 66.58 41.3 64.48 55.8s-13.8 22.6-17.7 25-5.1 3.3-4.8 5.1c.5 2.6 2.3 2.5 5.6 1.9 4.6-.8 29.19-11.8 30.29-38.7 1.6-34-31.09-71.4-89-71.1zm-429.18 144.7c-18.39 20.1-44.19 27.7-55.28 21.3C54.61 451 59.31 421.42 82 400c13.8-13 31.59-25 43.39-32.4 2.7-1.6 6.6-4 11.4-6.9.8-.5 1.2-.7 1.2-.7.9-.6 1.9-1.1 2.9-1.7 8.29 30.4.3 57.2-19.1 78.3zm134.36-91.4c-6.4 15.7-19.89 55.7-28.09 53.6-7-1.8-11.3-32.3-1.4-62.3 5-15.1 15.6-33.1 21.9-40.1 10.09-11.3 21.19-14.9 23.79-10.4 3.5 5.9-12.2 49.4-16.2 59.2zm111 53c-2.7 1.4-5.2 2.3-6.4 1.6-.9-.5 1.1-2.4 1.1-2.4s13.9-14.9 19.4-21.7c3.2-4 6.9-8.7 10.89-13.9 0 .5.1 1 .1 1.6-.13 17.9-17.32 30-25.12 34.8zm85.58-19.5c-2-1.4-1.7-6.1 5-20.7 2.6-5.7 8.59-15.3 19-24.5a36.18 36.18 0 0 1 1.9 10.8c-.1 22.5-16.2 30.9-25.89 34.4z" />
    </Fragment>
  );

  return (
    <_IconWrapper
      {...props}
      viewbox_width={612}
      viewbox_height={512}
      ChildSVG={SVGSass}
    />
  );
};

const IconRelatedBubble = (props) => {
  const SVGRelatedBubble = () => (
    <Fragment>
      <path
        d="M153.03,38.11,140.8,23.45A4.3548,4.3548,0,0,0,137.44,22H98.75V14.92A5.9322,5.9322,0,0,0,92.83,9H87.68a5.9344,5.9344,0,0,0-5.93,5.92V22H63.34c-2.29,0-4.09,1.49-4.09,3.39V55.61c0,1.9,1.8,3.39,4.09,3.39H81.75v6H42.56a4.3548,4.3548,0,0,0-3.36,1.45L26.97,81.11a2.9753,2.9753,0,0,0-.06,3.81l12.25,15.56A4.3508,4.3508,0,0,0,42.59,102H81.75v64H53.29A2.2961,2.2961,0,0,0,51,168.29v2.42A2.2961,2.2961,0,0,0,53.29,173h74.42a2.2961,2.2961,0,0,0,2.29-2.29v-2.42a2.2961,2.2961,0,0,0-2.29-2.29H98.75V102h17.91c2.29,0,4.09-1.49,4.09-3.39V68.39c0-1.9-1.8-3.39-4.09-3.39H98.75V59h38.66a4.3508,4.3508,0,0,0,3.43-1.52l12.25-15.56A2.9753,2.9753,0,0,0,153.03,38.11ZM86.75,14.92a.9261.9261,0,0,1,.93-.92h5.15a.9176.9176,0,0,1,.92.92V22h-7Zm7,151.08h-7V102h7Zm22-96.38V97.38H42.9L31.65,83.08,42.86,69.62ZM86.75,65V59h7v6ZM137.1,54.38H64.25V26.62h72.89l11.21,13.46Z"
        fill="inherit"
        stroke="inherit"
        strokeMiterlimit="10"
        strokeWidth="2"
      />
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={180} ChildSVG={SVGRelatedBubble} />
  );
};

const IconNotAvailable = (props) => {
  const SVGNotAvailable = () => (
    <Fragment>
      <div id="error-boundary-icon" />
      <path
        d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8c0,100.4-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250	
	c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8	
	S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"
      />
      <g>
        <path
          d="M249.1,324.5c-13.1,0.1-23.6,10.8-23.5,23.9c0.1,13.1,10.8,23.6,23.9,23.5c13-0.1,23.5-10.7,23.5-23.7	
		C272.9,335.1,262.2,324.4,249.1,324.5z"
        />
        <path
          d="M235.7,302.2c-1.7,0-3.2-1.3-3.4-3.1l-0.5-6.1c-2.4-19,4.8-39.8,24.8-61c18-18.7,28-32.4,28-48.3	
		c0-18-12.8-30-37.9-30.3c-13,0-27.2,3.4-37.2,9c-1.6,0.9-3.7,0.3-4.6-1.3c-0.1-0.1-0.1-0.2-0.1-0.3l-6.9-15.9	
		c-0.7-1.6-0.1-3.4,1.4-4.3c13.5-7.6,34.7-12.6,54.6-12.6c45.9,0,66.7,25,66.7,51.8c0,24-15.2,41.2-34.4,61.3	
    c-17.6,18.3-24,33.8-22.8,51.8l0.3,5.6c0.1,1.9-1.4,3.4-3.2,3.5c-0.1,0-0.1,0-0.2,0L235.7,302.2z"
          strokeWidth={10}
          strokeMiterlimit={10}
        />
      </g>
    </Fragment>
  );

  return (
    <_IconWrapper {...props} viewbox_width={500} ChildSVG={SVGNotAvailable} />
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
  IconDPs,
  IconPartition,
  IconCompareEstimates,
  IconStructure,
  IconTreemap,
  IconExplorer,
  IconBuilder,
  IconLab,
  IconMoney,
  IconEmployee,
  IconClipboard,
  IconExpend,
  IconPeople,
  IconResults,
  IconFlagLine,
  IconBaselineCloud,
  IconGit,
  IconGraphQL,
  IconHTML,
  IconNodeJS,
  IconPython,
  IconReact,
  IconSass,
  IconRelatedBubble,
  IconNotAvailable,
};
