import { Spinner, spinner_configs } from '../core/Spinner.js';
import { LeafSpinner } from './LeafSpinner.js';

export class SpinnerWrapper extends React.Component {

  render(){ 
    return !this.props.use_leaf_spinner ? 
      <div ref="main" /> : 
      <LeafSpinner config_name={this.props.config_name} faded={this.props.faded} />;
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

    

    //css(document.documentElement, {backgroundColor: 'red'}) ;
  }

  
}

SpinnerWrapper.defaultProps = {
  faded: true,
  scale: 2,
  use_leaf_spinner: true,
}