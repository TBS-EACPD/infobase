import { get_static_url, make_request } from './request_utils.js';
import { log_standard_event } from './analytics.js';

import { SpinnerWrapper } from '../util_components.js';


class DefaultErrorComponent extends React.Component {
  render(){
    return (
      window.lang === "en" ? 
        "An error occured" :
        "Une erreur est survenue"
    );
  }
}


export const ComponentLoader = (get_component, LoadingElement, errorElement)  => class ComponentLoader_ extends React.Component {
  constructor(){
    super();
    this.state = { loading: true };

    get_component()
      .then( Component => {
        
        this.Component = Component;
        this.timedOutStateChange = setTimeout(()=>{ //less janky if we force a timeout
          this.setState({loading: false});
        }, 250);
  
      })
      .catch( () => {
        this.try_to_catch_stale_client_error();
      });
  }
  try_to_catch_stale_client_error(){
    const unique_query_param = Date.now() + Math.random().toString().replace('.','');

    // Stale clients are our mostly likely production errors, always check for and attempt to handle them
    // Reloads the page if the client/CDN sha's are mismatched, otherwise displays the error component
    make_request( get_static_url('build_sha', unique_query_param) )
      .then( build_sha => {
        const local_sha_matches_remote_sha = build_sha.search(`^${window.sha}`) !== -1;
    
        if (local_sha_matches_remote_sha){
          this.display_error_component();
        } else {
          window.location.reload(true); // Force reload without cache
        }
      })
      .catch( () => {
        this.display_error_component();
      });
  }
  display_error_component(){
    !DEV && log_standard_event({ MISC1: "ERROR_IN_PROD" });

    this.Component = (
      errorElement ?
        () => errorElement :
        DefaultErrorComponent
    );

    this.setState({loading: false});
  }
  componentWillUnmount(){
    clearTimeout(this.timedOutStateChange);
  }
  render(){
    if(this.state.loading){
      if(LoadingElement){
        return LoadingElement;
      }
      return <SpinnerWrapper scale={3} />;
    } else {
      return React.createElement(
        this.Component,
        this.props
      );
    }
  }
}