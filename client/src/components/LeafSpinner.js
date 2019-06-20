import './LeafSpinner.scss';
import leaf_loading_spinner from '../svg/leaf-loading-spinner.svg';

export const LeafSpinner = ({config_name, faded}) => {

  const topOffset = faded ? document.getElementById('ib-site-header-area').offsetHeight : null;

  const leaf_spinner_configs = {
    initial: {
      transform: 'scale(2)',
      position: 'fixed',
    },
    route: {
      transform: 'scale(2)',
      position: 'fixed',
    },
    sub_route: {
      transform: 'scale(2)',
      position: 'fixed',
    },
    tabbed_panel: {
      transform: 'scale(1)',
      position: 'absolute',
      top: '40px',
    },
    small_inline: {
      transform: 'scale(0.25)',
      position: 'absolute',
      top: '9px',
      left: '-50%',
    },
  };

  let loader = leaf_loading_spinner;
  
  if (config_name === 'small_inline') {
    loader = leaf_loading_spinner.replace('stroke="#26374A"', 'stroke="#FFF"');
    loader = loader.replace('stroke="#2C70C9"', 'stroke="#FFF"');
    loader = loader.replace('fill="#FF0000"', 'fill="#FFF"');
  }

  return (
    <div className={`faded-loading-container--${faded}`} style={{top: topOffset}}>
      <div 
        className="leaf-spinner-container" 
        style={leaf_spinner_configs[config_name]}
        dangerouslySetInnerHTML={{__html: loader}}
      />
    </div>
  )
};
