import { withRouter } from 'react-router';

import { shallowEqualObjectsOverKeys } from '../general_utils.js';
import { PanelRegistry } from './PanelRegistry.js';
import { panel_context } from '../infographic/context.js';

export const PanelRenderer = withRouter(
  class PanelRenderer_ extends React.Component {
    render(){
      let {
        subject,
        panel_key,
        history,
        active_bubble_id,
      } = this.props;  

      const graph_obj = PanelRegistry.lookup(panel_key, subject.level);

      const graph_options = {history};

      const { Provider } = panel_context;

      const calculations = graph_obj.calculate(subject, graph_options);

      if(!calculations){
        return null;
      }
      return (
        <div id={panel_key} tabIndex="0">
          <Provider value={ {active_bubble_id, panel_key, subject} }>
            { graph_obj.render(calculations, graph_options) }
          </Provider>
        </div>
      );
    }
    shouldComponentUpdate(nextProps){
      return !shallowEqualObjectsOverKeys(nextProps, this.props, ['subject','panel_key']);
    } 
  }
);