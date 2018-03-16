import { Partition } from './Partition.js';
import { get_all_perspectives, all_data_types } from './partition_content/index.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { SpinnerWrapper } from '../util_components';
import { text_maker } from "../models/text";

export class PartitionRoute extends React.Component {
  constructor(){
    super()
    this.state = {loading: true};
    this.url_update_callback = (perspective, data_type) => {
      const new_path = `partition/${perspective}/${data_type}`;

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
      this.all_perspectives = get_all_perspectives();
      this.setState({loading: false}) 
    });
  }
  shouldComponentUpdate(nextProps){
    if (!_.isUndefined(this.partition)){
      // Once the Partition diagram has been initialized, need to ensure it stays in sync whenever the path updates
      const {
        perspective, 
        data_type,
      } = this.getValidatedRouteParams(nextProps);

      this.ensurePartitionStateMatchesRouteState(perspective, data_type);
    }

    // Should only need to update once, when the table dependencies finish loading and the spinner needs to be killed
    return !_.isUndefined(this.refs.spinner);
  }
  componentDidUpdate(){
    // Should only happen once, when the table dependencies finish loading and the spinner has been killed
    const {
      perspective, 
      data_type,
    } = this.getValidatedRouteParams(this.props);
    this.container = d3.select(ReactDOM.findDOMNode(this.refs.container));
    this.partition = new Partition(this.container, this.all_perspectives, all_data_types, perspective, data_type, this.url_update_callback);
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
    const route_perspective = props.match.params.perspective;
    const route_data_type = props.match.params.data_type;

    const route_data_type_and_perspective_combination_is_valid = !_.chain(this.all_perspectives)
      .filter( perspective => perspective.data_type === route_data_type && perspective.id === route_perspective )
      .isEmpty()
      .value();

    if (route_data_type_and_perspective_combination_is_valid){
      return {
        perspective: route_perspective,
        data_type: route_data_type,
      };
    } else {
      return {
        perspective: "dept",
        data_type: "exp",
      };
    }
  }
  ensurePartitionStateMatchesRouteState(route_perspective, route_data_type){
    const partition_perspective = this.partition.current_perspective_id;
    const partition_data_type = this.partition.current_data_type;

    if ( (route_perspective !== partition_perspective) && (route_data_type === partition_data_type) ) {
      this.partition.current_perspective_id = route_perspective;
      
      this.container.select(".select_perspective")
        .property("value", route_perspective)
        .dispatch("change");
    } else if (route_data_type !== partition_data_type) {
      this.partition.current_perspective_id = route_perspective;
      this.partition.current_data_type = route_data_type;

      this.container.select(".select_data_type")
        .property("value", route_data_type)
        .dispatch("change");
    }
  }
}