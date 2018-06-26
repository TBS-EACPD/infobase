import { SpinnerWrapper } from '../util_components.js';


const DefaultErrorComponent = _.constant(
  window.lang === "en" ? 
  "An error occured" :
  "Une erreur est survenue"
);

export const ComponentLoader = (get_component, LoadingElement, errorElement)  => class ComponentLoader_ extends React.Component {
  constructor(){
    super();
    this.state = { loading: true };

    get_component().then( Component => {
      
      this.Component = Component;
      setTimeout(()=>{ //less janky if we force a >500ms timeout
        this.setState({loading: false});
      }, 500);

    }).catch(()=>{

      this.Component = (
        errorElement ?
        () => errorElement :
        DefaultErrorComponent
      );
      this.setState({loading: false});
    })
    

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