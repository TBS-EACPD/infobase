import { get_static_url, make_request } from './request_utils.js';

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
  
        this.Component = (
          errorElement ?
            () => errorElement :
            DefaultErrorComponent
        );

        // Attempts to identify and handle most common production error case, where the client's out of sync with the CDN content
        // Does this by compairing the client's sha to the CDN's build sha
        // Reloads the page if the sha's are mismatched, otherwise display the error component
        const unique_query_param = Date.now() + Math.random();
        make_request( get_static_url('build_sha', unique_query_param) )
          .then( build_sha => {
            const local_sha_matches_remote_sha = build_sha.search(`^${window.sha}`) !== -1;

            if (local_sha_matches_remote_sha){
              this.setState({loading: false}); // Display error component
            } else {
              window.location.reload(true); // Force reload without cache
            }
          })
          .catch( () => {
            this.setState({loading: false});
          })
      });
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