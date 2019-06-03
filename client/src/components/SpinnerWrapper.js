import { Spinner, spinner_configs } from '../core/Spinner.js';
import { Loader } from './Loader.js';

export class SpinnerWrapper extends React.Component {
  render(){ 
    if (!this.props.leaf) {
      return <div ref="main" /> 
    } else {
      return <Loader scale={this.props.scale}/>
    }
  }
  componentDidMount(){ 
    const { 
      scale,
      config_name,
      leaf,
    } = this.props;

    const config = !_.isUndefined(spinner_configs[config_name]) ? 
      spinner_configs[config_name] : 
      {scale};

    if (!leaf) {
      this.refs.main.appendChild( new Spinner(config).spin().el );
    }
  }
}

SpinnerWrapper.defaultProps = {
  scale: 2,
  leaf: true,
}
