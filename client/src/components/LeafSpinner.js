import './LeafSpinner.scss';
import leaf_loading_spinner from '../svg/leaf-loading-spinner.svg';


export const LeafSpinner = ({scale, position, faded}) => {

  const topOffset = faded ? document.getElementById('ib-site-header-area').offsetHeight : '';
  const setPosition = topOffset ? position : null;

  return (
    <div className={`faded-loading-container--${faded}`} style={{top: topOffset, position: setPosition}}>
      <div 
        className="leaf-spinner-container" 
        style={{transform: `scale(${scale})`, position: position}}
        dangerouslySetInnerHTML={{__html: leaf_loading_spinner}}
      />
    </div>
  )
};