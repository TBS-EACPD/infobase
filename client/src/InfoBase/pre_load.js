import { Spinner } from '../core/Spinner.js';
import '../components/Loader.scss';

export default function(){
  const app_el = document.querySelector('#app');
  //const spinner = new Spinner( Spinner.__configs.initial );
  
  const containerDiv = document.createElement('div');
  containerDiv.className = 'loader-container';
  containerDiv.setAttribute('style', 'transform: scale(2)');
  
  const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg1.setAttribute("viewBox", "25 25 50 50" );
  svg1.setAttribute('class', 'circular-loader');
  
  const cir1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  cir1.setAttribute('class', 'loader-path');
  cir1.setAttribute("cx", 50 );
  cir1.setAttribute("cy", 50 );
  cir1.setAttribute("r", 22);
  cir1.setAttribute("stroke", '#26374A');
  cir1.setAttribute("strokeWidth", '2');
  cir1.setAttribute('fill', 'none');
  
  const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg2.setAttribute('class', 'circular-loader-two');
  svg2.setAttribute("viewBox", "25 25 50 50" );
  
  const cir2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  cir2.setAttribute('class', 'loader-path-two');
  cir2.setAttribute("cx", 50 );
  cir2.setAttribute("cy", 50 );
  cir2.setAttribute("r", 20);
  cir2.setAttribute("stroke", '#2C70C9');
  cir2.setAttribute("strokeWidth", '1');
  cir2.setAttribute('fill', 'none');

  const svg3 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg3.setAttribute('version', '1.1');
  svg3.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg3.setAttribute('x', '0px');
  svg3.setAttribute('y', '0px');
  svg3.setAttribute("viewBox", "0 0 650 650" );

  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute('class', 'leaf');
  path.setAttribute('d', "M314.7,562l5.2-99.1c0.3-6-4.4-11.1-10.4-11.4c-0.8,0-1.6,0-2.4,0.1l-98.7,17.3l13.3-36.8c1.1-3,0.2-6.4-2.3-8.4l-108.1-87.5l24.4-11.4c3.4-1.6,5.1-5.5,3.9-9.1L118.2,250l62.3,13.2c3.5,0.7,7-1.1,8.4-4.4l12.1-28.4l48.6,52.2c2.8,3,7.6,3.1,10.6,0.3c1.8-1.8,2.7-4.3,2.2-6.8L239,155.2l37.6,21.7c3.6,2.1,8.1,0.9,10.2-2.7c0.1-0.1,0.2-0.3,0.2-0.4L325,99l38.1,74.9c1.8,3.7,6.3,5.2,10,3.3c0.1-0.1,0.3-0.2,0.4-0.2l37.6-21.7l-23.4,120.9c-0.8,4.1,1.9,8,5.9,8.7c2.5,0.5,5.1-0.3,6.8-2.2l48.6-52.2l12.1,28.4c1.4,3.3,4.9,5.1,8.4,4.4l62.3-13.2l-21.4,65.7c-1.2,3.6,0.5,7.5,3.9,9.1l24.4,11.4l-108.1,87.5c-2.5,2-3.4,5.4-2.3,8.4l13.3,36.8l-98.7-17.3c-5.9-1-11.6,3-12.6,8.9c-0.1,0.8-0.2,1.6-0.1,2.4l5.2,99.1L314.7,562L314.7,562z");

  svg2.appendChild(cir2);
  svg1.appendChild(cir1);
  svg3.appendChild(path);
  containerDiv.appendChild(svg1);
  containerDiv.appendChild(svg2);
  containerDiv.appendChild(svg3);

  app_el.appendChild(containerDiv);
  
  //spinner.spin(app_el);
  app_el.setAttribute('aria-busy', 'true');

  return function stop(){
    //spinner.stop();
    app_el.removeChild(containerDiv);
    app_el.removeAttribute('aria-busy');
  };
} 
