import { withRouter } from 'react-router';

import { shallowEqualObjectsOverKeys } from '../general_utils.js';
import { PanelGraph } from '../core/PanelGraph.js';
import { panel_context } from '../infographic/context.js';

export const ReactPanelGraph = withRouter(
  class ReactPanelGraph_ extends React.Component {
    render(){
      let {
        subject,
        graph_key,
        history,
        bubble,
      } = this.props;  

      const graph_obj = PanelGraph.lookup(graph_key, subject.level);

      const graph_options = {history};

      const { Provider } = panel_context;
      
      const calculations = graph_obj.calculate(subject, graph_options);
      
      if(!calculations){
        return null;
      }
      return <div id={graph_key} tabIndex="0">
        <Provider value={ {bubble, graph_key, subject} }>
          { graph_obj.render(calculations, graph_options) }
        </Provider>
      </div>;

      
    }
    shouldComponentUpdate(nextProps){
      return !shallowEqualObjectsOverKeys(nextProps, this.props, ['subject','graph_key']);
    }
    
  }
);