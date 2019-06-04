import './Loader.scss';
import leaf_loading_spinner from '../svg/leaf-loading-spinner.svg';

export const Loader = ({scale}) => (
  <div 
    className="loader-container" 
    style={{transform: `scale(${scale})`}}
    dangerouslySetInnerHTML={{__html: leaf_loading_spinner}}
  />
);