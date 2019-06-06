import './LeafSpinner.scss';
import leaf_loading_spinner from '../svg/leaf-loading-spinner.svg';

export const LeafSpinner = ({scale, position}) => (
  <div className='faded-loading-container' style={{top: document.getElementById('ib-site-header-area').offsetHeight, position: position}}>
    <div 
      className="leaf-spinner-container" 
      style={{transform: `scale(${scale})`, position: position}}
      dangerouslySetInnerHTML={{__html: leaf_loading_spinner}}
    />
  </div>
);