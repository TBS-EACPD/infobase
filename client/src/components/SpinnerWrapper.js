import { Spinner, spinner_configs } from '../core/Spinner.js';
import { LeafSpinner } from './LeafSpinner.js';

export class SpinnerWrapper extends React.Component {
  render(){ 
    return !this.props.use_leaf_spinner ? 
      <div ref="main" /> : 
      <LeafSpinner scale={this.props.scale} position={this.props.position} container={this.props.container} faded={this.props.faded}/>;
  }
  componentDidMount(){ 
    const { 
      scale,
      config_name,
      use_leaf_spinner,
    } = this.props;

    const config = !_.isUndefined(spinner_configs[config_name]) ? 
      spinner_configs[config_name] : 
      {scale};

    if (!use_leaf_spinner) {
      this.refs.main.appendChild( new Spinner(config).spin().el );
    }
  }
}

SpinnerWrapper.defaultProps = {
  faded: true,
  container: document.body,
  position: 'fixed',
  scale: 2,
  use_leaf_spinner: true,
}