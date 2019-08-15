import './icons.scss';
import { trivial_text_maker } from '../models/text.js';
import { businessConstants } from '../models/businessConstants.js';
import { Fragment } from 'react';
import classNames from 'classnames';


const { result_simple_statuses } = businessConstants;

const _IconWrapper = (props) => {
  const {
    title,
    width,
    icon_class,
    color_set_by_css,
    color,
    ChildIcon,
  } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox={`0 0 ${width} ${width}`} className={icon_class}>
      <title>{title}</title>
      <ChildIcon color_set_by_css={color_set_by_css} color={color}/>
    </svg>
  );
};
_IconWrapper.defaultProps = {
  width: 24,
  icon_class: "icon--svg-inline",
  color_set_by_css: true,
};

const SVGHome = (props) => {
  const {
    color_set_by_css,
    color,
  } = props;
  return (
    <Fragment>
      <path fill="none" d="M0 0h24v24H0V0z"/>
      <path className={color_set_by_css && "svg-fill"} style={color_set_by_css ? undefined : {fill: color}}
        d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
    </Fragment>
  );
};

const IconHome = (props) => {
  const {
    title,
    icon_class,
    color_set_by_css,
    color,
  } = props;
  return (
    <_IconWrapper title={title} width={24} icon_class={icon_class} color_set_by_css={color_set_by_css} color={color} ChildIcon={SVGHome}/>
  )
}


const IconFeedback = (props) => {
  const {
    color_set_by_css,
    color,
  } = props;

  return (
    <path className={color_set_by_css && "svg-stroke"} fill="none" style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="2" strokeMiterlimit="1"
      d="M21.8,19.2c0.1,0-0.3-0.5-0.4-0.7l-1.7-2.7c0.8-0.7,2.2-2.7,2.1-4.5c-0.2-4-4.5-7.3-10-7.3s-10,3.3-10,7.3
      s4.5,7.3,10,7.3c1.8,0,3.3-0.2,4.7-0.8C20.6,19,21.2,19.3,21.8,19.2z"/>
  );
};

const IconAbout = (props) => {
  const {
    color_set_by_css,
    color,
  } = props;
  
  return (
    <Fragment>
      <path className={color_set_by_css && "svg-stroke"} fill="none" style={color_set_by_css ? undefined : {stroke: color}} d="M12,2.8c5.1,0,9.2,4.1,9.2,9.2s-4.1,9.2-9.2,9.2c-5.1,0-9.2-4.1-9.2-9.2c0-3.7,2.2-7,5.6-8.5
	C9.5,3,10.8,2.8,12,2.8 M12,1.8C6.4,1.8,1.8,6.4,1.8,12S6.4,22.2,12,22.2S22.2,17.6,22.2,12S17.6,1.8,12,1.8z"/>
      <path className={color_set_by_css && "svg-fill"} style={color_set_by_css ? undefined : {fill: color}} d="M14.6,16.7c-0.9,1.9-2.2,2.8-2.9,2.9c-0.7,0.1-1-0.5-1-2.2c0.1-2,0.1-3.3,0.2-5.1c0-0.7,0-1-0.3-0.9
	c-0.3,0.1-0.7,0.6-1.1,1.1l-0.3-0.3c0.8-1.4,2.1-2.7,3-2.9c0.8-0.2,0.9,0.5,0.9,2.5c-0.1,1.6-0.1,3.3-0.2,4.9c0,0.6,0.1,0.8,0.3,0.8
	c0.2,0,0.5-0.3,1-1.1L14.6,16.7z M13,5.8c0.1,0.7-0.2,1.5-0.9,1.7c-0.6,0.1-1.1-0.2-1.2-0.9c-0.1-0.6,0.2-1.5,1-1.7
	C12.4,4.7,12.8,5.2,13,5.8z"/>
    </Fragment>
  );
};

const IconGlossary = (props) => {
  const {
    color_set_by_css,
    color,
  } = props;
  
  return (
    <Fragment>
      <g>
        <path className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? {fill: "none"} : {stroke: color, fill: "none"}}
          d="M5.5,2.3h12.9c0.7,0,1.4,0.6,1.4,1.4v16.7c0,0.7-0.6,1.4-1.4,1.4H5.5c-0.7,0-1.4-0.6-1.4-1.4V3.6
          C4.2,2.9,4.8,2.3,5.5,2.3z"/>
        <line className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}}
          x1="6.7" y1="2.5" x2="6.7" y2="21.7"/>
      </g>
      <path className={color_set_by_css && classNames("svg-fill","svg-stroke")} style={color_set_by_css ? undefined : {stroke: color, fill: color}}
        d="M12.1,18.6c0-0.1,0-0.2,0.1-0.2l4.2-5v0h-3.6c-0.2,0-0.4-0.2-0.4-0.3l0,0c0-0.2,0.2-0.3,0.4-0.3h4.5
        c0.2,0,0.4,0.2,0.4,0.3v0c0,0.1,0,0.2-0.1,0.2l-4.2,5v0h4c0.2,0,0.4,0.2,0.4,0.3l0,0c0,0.2-0.2,0.3-0.4,0.3h-4.9
        C12.3,19,12.1,18.8,12.1,18.6L12.1,18.6z"/>
      <path className={color_set_by_css && classNames("svg-fill","svg-stroke")} style={color_set_by_css ? undefined : {stroke: color, fill: color}}
        d="M10.3,10.1l-0.6,1.6C9.6,11.9,9.5,12,9.3,12H9.1c-0.2,0-0.4-0.2-0.4-0.4c0,0,0-0.1,0-0.1l2.3-6
        c0.1-0.2,0.2-0.3,0.4-0.3h0.7c0.2,0,0.3,0.1,0.4,0.3l2.3,6c0.1,0.2,0,0.4-0.2,0.5c0,0-0.1,0-0.1,0h-0.2c-0.2,0-0.3-0.1-0.4-0.3
        l-0.6-1.6C13.2,10,13,9.9,12.9,9.9h-2.2C10.5,9.9,10.4,10,10.3,10.1z M12.4,9.2c0.2,0,0.4-0.2,0.4-0.4c0,0,0-0.1,0-0.1l-0.5-1.4
        C12,6.8,11.9,6.4,11.8,6h0c-0.1,0.4-0.2,0.8-0.4,1.2l-0.5,1.4c-0.1,0.2,0,0.4,0.2,0.5c0,0,0.1,0,0.1,0H12.4z"/>
    </Fragment>
  );
};

const IconDataset = (props) => {
  const {
    color_set_by_css,
    color,
  } = props;
  
  return (
    <Fragment>
      <path fill="none" className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" d="M116.5,98.5h367
        c6.6,0,12,5.4,12,12v394c0,6.6-5.4,12-12,12h-367c-6.6,0-12-5.4-12-12v-394C104.5,103.9,109.9,98.5,116.5,98.5z"/>
      <line fill="none" className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="190.5" x2="494.5" y2="190.5"/>
      <line fill="none" className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="272.5" x2="495.5" y2="272.5"/>
      <line fill="none" className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="354.5" x2="495.5" y2="354.5"/>
      <line fill="none" className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="434.5" x2="495.5" y2="434.5"/>
      <line fill="none" className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="234.5" y1="197.5" x2="234.5" y2="515.5"/>
      <line fill="none" className={color_set_by_css && "svg-stroke"} style={color_set_by_css ? undefined : {stroke: color}} strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="365.5" y1="194.5" x2="365.5" y2="515.5"/>
    </Fragment>
  );
};

const IconShare = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="icon--svg-inline">
      <title>{title}</title>
      <path d="M0 0h24v24H0z" fill="none"/>
      <path className="svg-fill" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34
        3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65
        0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  );
};

const IconPermalink = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" className="icon--svg-inline">
      <title>{title}</title> 
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
      <g className="svg-fill" >
        <path d="M20.437 2.69c-3.37 0-5.778 3.05-8.186 5.297.322 0 .804-.16 1.285-.16.803 0 1.605.16 2.408.48 1.284-1.283 2.568-2.727 4.494-2.727.963 0 2.087.48 2.89 1.123 1.605 1.605 1.605 4.174 0 5.78l-4.174 4.172c-.642.642-1.926 1.124-2.89 1.124-2.246 0-3.37-1.446-4.172-3.212l-2.086 2.087c1.284 2.408 3.21 4.173 6.1 4.173 1.926 0 3.69-.802 4.815-2.086l4.172-4.174c1.445-1.444 2.408-3.21 2.408-5.297-.32-3.53-3.53-6.58-7.063-6.58z"/>
        <path d="M13.535 22.113l-1.444 1.444c-.64.642-1.925 1.124-2.89 1.124-.962 0-2.085-.48-2.888-1.123-1.605-1.605-1.605-4.334 0-5.778l4.174-4.175c.642-.642 1.926-1.123 2.89-1.123 2.246 0 3.37 1.605 4.172 3.21l2.087-2.087c-1.284-2.407-3.21-4.173-6.1-4.173-1.926 0-3.692.803-4.815 2.087L4.547 15.69c-2.73 2.73-2.73 7.063 0 9.63 2.568 2.57 7.062 2.73 9.47 0l3.05-3.05c-.482.162-.963.162-1.445.162-.803 0-1.445 0-2.087-.32z"/>
      </g>
    </svg>
  );
};

const IconDownload = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="icon--svg-inline">
      <title>{title}</title>
      <path className="svg-fill" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </svg>
  );
};

const IconChevron = (props) => {
  const {
    title,
    rotated,
  } = props;

  const rotation = rotated ? "rotate(180 250 250)" : "rotate(0)";

  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500" className="icon--svg-inline">
      <title>{title}</title>
      <polygon transform={rotation} className="svg-fill" points="469.7,189.8 377.9,103.2 377.9,103.2 250.1,223.8 122.1,103.1 30.3,189.7 249.8,396.8 249.9,396.7 
        250.2,396.9 "/>
    </svg>
  );
};

const IconZoomIn = (props) => {
  const {
    title,
  } = props;


  return (
    <svg className="icon--svg-inline" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <title>{title}</title>
      <path className="svg-fill" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      <path fill="none" d="M0 0h24v24H0V0z"/>
      <path className="svg-fill" d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
    </svg>
  );
};
IconZoomIn.defaultProps = {
  title: trivial_text_maker("zoom_in"),
};


const IconZoomOut = (props) => {
  const {
    title,
  } = props;


  return (
    <svg className="icon--svg-inline" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <title>{title}</title>
      <path fill="none" d="M0 0h24v24H0V0z"/>
      <path className="svg-fill" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
    </svg>
  );
};
IconZoomOut.defaultProps = {
  title: trivial_text_maker("zoom_out"),
};

const IconCheck = (props) => {
  const {
    title,
    width,
    height,
  } = props;

  return (
    <svg className="icon--svg" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500" width={width} height={height}>
      <title>{title}</title>
      <path className="svg-fill" d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8s-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250
        c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
        S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"/>
      <path className="svg-fill" d="M234.9,354.7l127.9-186.2c3.7-5.5,3-13.1-1.6-17.1L347,139.2c-1.7-1.5-3.9-2.3-6.1-2.3l0,0
        c-3.7,0.1-7.1,2-9.1,5.1L218.5,307l-57.7-48.5c-1.9-1.7-4.2-2.6-6.7-2.8l0,0c-1.8-0.1-3.5,0.8-4.6,2.2l-13.9,20.7
        c-2.1,3.2-0.5,8.6,3.6,12l80.9,68.1c1.9,1.7,4.2,2.6,6.7,2.8c1.8,0.1,3.5-0.8,4.6-2.2"/>
    </svg>
  );
};
IconCheck.defaultProps = {
  title: result_simple_statuses.met.text,
};

const IconAttention = (props) => {
  const {
    title,
    width,
    height,
  } = props;

  return (
    <svg className="icon--svg" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500" width={width} height={height}>
      <title>{title}</title>
      <path className="svg-fill" d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8c0,100.4-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250
        c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
        S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"/>
      <g>
        <path className="svg-fill" d="M276.6,126.3L276.6,126.3l-53.1,0c-5.8,0-10.3,9-9.6,19.2l9.5,147.8c0.6,8.7,4.7,15.3,9.6,15.3h32.2
          c4.8,0,8.9-6.4,9.6-14.9l11.5-147.8C286.9,135.5,282.4,126.3,276.6,126.3z"/>
        <path className="svg-fill" d="M250,326.3c-13.1,0.1-23.6,10.8-23.5,23.9c0.1,13.1,10.8,23.6,23.9,23.5c13-0.1,23.5-10.7,23.5-23.7
          C273.8,336.9,263.1,326.3,250,326.3z"/>
      </g>
    </svg>
  );
};
IconAttention.defaultProps = {
  title: result_simple_statuses.not_met.text,
};

const IconNA = (props) => {
  const {
    title,
    width,
    height,
  } = props;

  return (
    <svg className="icon--svg" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500" width={width} height={height}>
      <title>{title}</title>
      <path className="svg-fill" d="M250,68.2c100.4,0,181.8,81.4,181.8,181.8S350.4,431.8,250,431.8S68.3,350.4,68.3,250
        c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
        S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"/>
      <path className="svg-fill" d="M168.4,225.5h163.3c4.9,0,8.9,4,8.9,8.9v31.3c0,4.9-4,8.9-8.9,8.9H168.4c-4.9,0-8.9-4-8.9-8.9v-31.3
        C159.5,229.5,163.5,225.5,168.4,225.5z"/>
    </svg>
  );
};
IconNA.defaultProps = {
  title: result_simple_statuses.not_available.text,
};

const IconClock = (props) => {
  const {
    title,
    width,
    height,
  } = props;

  return (
    <svg className="icon--svg" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 500 500" width={width} height={height}>
      <title>{title}</title>
      <path className="svg-fill" d="M250,68.2c100.4,0,181.7,81.4,181.7,181.8s-81.4,181.7-181.8,181.7S68.2,350.4,68.2,250
        c0-48.2,19.1-94.4,53.2-128.5C155.5,87.3,201.8,68.1,250,68.2 M250,37.2C132.5,37.2,37.2,132.5,37.2,250S132.5,462.8,250,462.8
        S462.8,367.5,462.8,250S367.5,37.2,250,37.2z"/>
      <path className="svg-fill" d="M226.8,267.3c0.6,1.5,1.8,2.6,2.9,3.8l82.9,82.9c3,3,7.8,3,10.7,0l0,0l15.6-15.6c3-3,3-7.8,0-10.7l0,0
        l-75.5-75.5v-135c0-4.6-3.7-8.3-8.3-8.3l0,0h-20.7c-4.6,0-8.3,3.7-8.3,8.3v147.1c0,0,0,0,0,0.1C226.1,265.2,226.5,266.5,226.8,267.3"/>
    </svg>
  );
};
IconClock.defaultProps = {
  title: result_simple_statuses.future.text,
};

export {
  Icon,
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
  IconCheck,
  IconAttention,
  IconNA,
  IconClock,
};
  