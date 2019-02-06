import { Spinner, spinner_configs } from '../core/Spinner.js';

export class SpinnerWrapper extends React.Component {
  render(){ return <div ref="main" /> }
  componentDidMount(){ 
    const { 
      scale,
      config_name,
    } = this.props;

    const config = !_.isUndefined(spinner_configs[config_name]) ? 
      spinner_configs[config_name] : 
      {scale};

    this.refs.main.appendChild( new Spinner(config).spin().el );
  }
}

SpinnerWrapper.defaultProps = {
  scale: 2,
}