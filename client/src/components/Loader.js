import './Loader.scss' ;
//import { logo } from '../svg/loader.svg'
//import { get_static_url } from '../request_utils.js';

export const Loader = ({scale}) => {
  return (
    <div className="loader-container" style={{transform: `scale(${scale})`}}>
      <svg className="circular-loader"viewBox="25 25 50 50" >
        <circle className="loader-path" cx="50" cy="50" r="22" fill="none" stroke={window.infobase_color_constants.primaryColor} strokeWidth="2" />
      </svg>
      <svg className="circular-loader-two"viewBox="25 25 50 50" >
        <circle className="loader-path-two" cx="50" cy="50" r="20" fill="none" stroke={window.infobase_color_constants.secondaryColor} strokeWidth="1" />
      </svg>
      <svg version="1.1" id="logo" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
        viewBox="0 0 650 650">
        <path className="leaf" d="M314.7,562l5.2-99.1c0.3-6-4.4-11.1-10.4-11.4c-0.8,0-1.6,0-2.4,0.1l-98.7,17.3l13.3-36.8
          c1.1-3,0.2-6.4-2.3-8.4l-108.1-87.5l24.4-11.4c3.4-1.6,5.1-5.5,3.9-9.1L118.2,250l62.3,13.2c3.5,0.7,7-1.1,8.4-4.4l12.1-28.4
          l48.6,52.2c2.8,3,7.6,3.1,10.6,0.3c1.8-1.8,2.7-4.3,2.2-6.8L239,155.2l37.6,21.7c3.6,2.1,8.1,0.9,10.2-2.7c0.1-0.1,0.2-0.3,0.2-0.4
          L325,99l38.1,74.9c1.8,3.7,6.3,5.2,10,3.3c0.1-0.1,0.3-0.2,0.4-0.2l37.6-21.7l-23.4,120.9c-0.8,4.1,1.9,8,5.9,8.7
          c2.5,0.5,5.1-0.3,6.8-2.2l48.6-52.2l12.1,28.4c1.4,3.3,4.9,5.1,8.4,4.4l62.3-13.2l-21.4,65.7c-1.2,3.6,0.5,7.5,3.9,9.1l24.4,11.4
          l-108.1,87.5c-2.5,2-3.4,5.4-2.3,8.4l13.3,36.8l-98.7-17.3c-5.9-1-11.6,3-12.6,8.9c-0.1,0.8-0.2,1.6-0.1,2.4l5.2,99.1L314.7,562
          L314.7,562z"/>
      </svg>
    </div>		
  )
}


