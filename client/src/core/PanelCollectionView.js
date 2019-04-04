import withRouter from 'react-router/withRouter';

import { shallowEqualObjectsOverKeys } from '../general_utils.js';
import { PanelGraph } from '../core/PanelGraph.js';

export const ReactPanelGraph = withRouter(
  class ReactPanelGraph_ extends React.Component {
    render(){
      let {
        subject,
        graph_key,
        history,
      } = this.props;  

      const graph_obj = PanelGraph.lookup(graph_key, subject.level)

      const graph_options = {history};


      const calculations = graph_obj.calculate(subject, graph_options);

      if(!calculations){
        return null;
      }
      return <div id={graph_key} tabIndex="0">
        {graph_obj.render(calculations, graph_options)}
      </div>

      
    }
    shouldComponentUpdate(nextProps){
      return !shallowEqualObjectsOverKeys(nextProps, this.props, ['subject','graph_key']);
    }
    
  }
);