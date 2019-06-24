import './LeafSpinner.scss';
import leaf_loading_spinner from '../svg/leaf-loading-spinner.svg';

export const LeafSpinner = ({config_name}) => {

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
    tabbed_content: {
      transform: 'scale(1)',
      position: 'absolute',
      top: '50%',
    },
    small_inline: {
      transform: 'scale(0.25)',
      position: 'absolute',
      top: '9px',
      left: '-50%',
    },
  };

  let loader = leaf_loading_spinner;
  let setPosition = '';
  
  if (config_name === 'small_inline') {
    loader = leaf_loading_spinner.replace(`stroke="${window.infobase_color_constants.primaryColor}"`, 'stroke="#FFF"');
    loader = loader.replace(`stroke="${window.infobase_color_constants.secondaryColor}"`, 'stroke="#FFF"');
    loader = loader.replace('fill="#FF0000"', 'fill="#FFF"');
    loader = loader.replace('faded-background--true', 'faded-background--false');
    setPosition = 'relative';
  }

  return (
    <div style={{position: setPosition}}>
      <div 
        className="leaf-spinner-container" 
        style={leaf_spinner_configs[config_name]}
        dangerouslySetInnerHTML={{__html: loader}}
      />
    </div>
  )
};
