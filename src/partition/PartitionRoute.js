import { Partition, presentation_schemes_by_data_options } from './Partition.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { SpinnerWrapper } from '../util_components';
import { text_maker } from "../models/text";

export class PartitionRoute extends React.Component {
  constructor(){
    super()
    this.state = {loading: true};
    this.update_url = (method, value_attr) => {
      const new_path = `partition/${method}/${value_attr}`;

      this.props.history.push('/'+new_path);

      const el_to_update = document.querySelector('#wb-lng a');
      const link = _.first(el_to_update.href.split("#"));
      if(link){
        el_to_update.href = `${link}#${new_path}`;
      }
    }
  }
  componentDidMount(){
    ensure_loaded({
      table_keys: ['table6', 'table8', 'table12','table305'],
    }).then( () => { 
      this.setState({loading: false}) 
    });
  }
  shouldComponentUpdate(nextProps){
    if (!_.isUndefined(this.partition)){
      // Once the Partition diagram has been initialized, need to ensure it stays in sync whenever the path updates
      const {
        method, 
        value_attr,
      } = this.getValidatedRouteParams(nextProps);

      this.ensurePartitionStateMatchesRouteState(method, value_attr);
    }

    // Should only need to update once, when the table dependencies finish loading and the spinner needs to be killed
    return !_.isUndefined(this.refs.spinner);
  }
  componentDidUpdate(){
    // Should only happen once, when the table dependencies finish loading and the spinner has been killed
    const {
      method, 
      value_attr,
    } = this.getValidatedRouteParams(this.props);
    this.container = d3.select(ReactDOM.findDOMNode(this.refs.container));
    this.partition = new Partition(this.container, this.update_url, method, value_attr);
  }
  render(){
    return (
      <StandardRouteContainer
        ref="container"
        title={text_maker("partition_title")}
        description={text_maker("partition_route_description")}
        breadcrumbs={[text_maker("partition_title")]}
        route_key="partition"
      >
        { this.state.loading && <SpinnerWrapper ref="spinner" scale={4} /> }
      </StandardRouteContainer>
    );
  }
  getValidatedRouteParams(props){
    const route_method = props.match.params.method;
    const route_value_attr = props.match.params.value_attr;

    const route_value_attr_is_valid = _.chain(presentation_schemes_by_data_options)
      .map( presentation_schemes_by_data_option => presentation_schemes_by_data_option.id )
      .indexOf(route_value_attr)
      .value() !== -1;

    const route_method_is_valid = route_value_attr_is_valid &&  _.chain(presentation_schemes_by_data_options)
      .find( presentation_schemes_by_data_option => presentation_schemes_by_data_option.id === route_value_attr )
      .pick( "presentation_schemes" )
      .flatMap()
      .indexOf( route_method )
      .value() !== -1;

    if (route_value_attr_is_valid && route_method_is_valid){
      return {
        method: route_method,
        value_attr: route_value_attr,
      };
    } else {
      return {
        method: "dept",
        value_attr: "exp",
      };
    }
  }
  ensurePartitionStateMatchesRouteState(route_method, route_value_attr){
    const partition_method = this.partition.method;
    const partition_value_attr = this.partition.value_attr;

    if ( (route_method !== partition_method) && (route_value_attr === partition_value_attr) ) {
      this.partition.method = route_method;
      
      this.container.select(".select_root")
        .property("value", route_method)
        .dispatch("change");
    } else if (route_value_attr !== partition_value_attr) {
      this.partition.method = route_method;
      this.partition.value_attr = route_value_attr;

      this.container.select(".select_value_attr")
        .property("value", route_value_attr)
        .dispatch("change");
    }
  }
}