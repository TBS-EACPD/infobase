import './LeafSpinner.scss';
import leaf_loading_spinner from '../svg/leaf-loading-spinner.svg';

export const LeafSpinner = ({config_name}) => {

  const default_spinner_config_form = (scale) => ({
    outer_positioning: 'default',
    spinner_container_style: {
      transform: `scale(${scale})`,
      position: 'fixed',
    },
    svg_modifier: _.identity,
  });

  const leaf_spinner_configs = {
    initial: default_spinner_config_form(2),
    route: default_spinner_config_form(2),
    sub_route: default_spinner_config_form(2),
    tabbed_content: {
      outer_positioning: 'default',
      spinner_container_style: {
        transform: `scale(1)`,
        position: 'absolute',
        top: '50%',
      },
      svg_modifier: _.identity,
    },
    small_inline: {
      outer_positioning: 'relative',
      spinner_container_style: {
        transform: 'scale(0.25)',
        position: 'absolute',
        top: '9px',
        left: '-50%',
      },
      svg_modifier: (svg) => svg
        .replace(`stroke="${window.infobase_color_constants.primaryColor}"`, 'stroke="#FFF"')
        .replace(`stroke="${window.infobase_color_constants.secondaryColor}"`, 'stroke="#FFF"')
        .replace('fill="#FF0000"', 'fill="#FFF"')
        .replace('faded-background--true', 'faded-background--false'),
    },
  };
<<<<<<< HEAD
  
=======

>>>>>>> Small style cleanup in LeafSpinner.scss and panel-components.js, tweak LeafSpinner.js configs and their usage
  const {
    outer_positioning,
    spinner_container_style,
    svg_modifier,
  } = leaf_spinner_configs[config_name];

  return (
    <div style={{position: outer_positioning}}>
      <div 
        className="leaf-spinner-container" 
        style={spinner_container_style}
        dangerouslySetInnerHTML={{__html: svg_modifier(leaf_loading_spinner)}}
      />
    </div>
  );
};
