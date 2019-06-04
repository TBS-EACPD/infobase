//import { Spinner } from '../core/Spinner.js';
import '../components/Loader.scss';
import leaf_loading_spinner from '../svg/leaf-loading-spinner.svg';

export default function(){
  const app_el = document.querySelector('#app');
  
  const containerDiv = document.createElement('div');
  containerDiv.className = 'loader-container';
  containerDiv.setAttribute('style', 'transform: scale(2)');

  containerDiv.innerHTML = leaf_loading_spinner;

  app_el.appendChild(containerDiv);
  
  //spinner.spin(app_el);
  app_el.setAttribute('aria-busy', 'true');

  return function stop(){
    //spinner.stop();
    app_el.removeChild(containerDiv);
    app_el.removeAttribute('aria-busy');
  };
} 
