import { withRouter } from 'react-router';

import { PanelRegistry } from './PanelRegistry.js';

import { shallowEqualObjectsOverKeys } from '../general_utils.js';

export const panel_context = React.createContext(null);

export const PanelRenderer = withRouter(
  class PanelRenderer_ extends React.Component {
    render(){
      const {
        subject,
        panel_key,
        history,
        active_bubble_id,
        panel_filter,
      } = this.props;

      const panel_obj = PanelRegistry.lookup(panel_key, subject.level);

      const panel_options = {history};
      const panel_filter_arr = _.map(panel_filter, (value, key) => panel_filter[key] && key);
      const isFiltered = _.intersection(panel_filter_arr, panel_obj.depends_on).length > 0;

      const { Provider } = panel_context;

      const calculations = panel_obj.calculate(subject, panel_options);

      if(!calculations){
        return null;
      }
      return (
        isFiltered &&
        <div id={panel_key} tabIndex="0">
          <Provider value={ {active_bubble_id, panel_key, subject} }>
            { panel_obj.render(calculations, panel_options) }
          </Provider>
        </div>
      );
    }
    shouldComponentUpdate(nextProps){
      return !shallowEqualObjectsOverKeys(nextProps, this.props, ['subject', 'panel_key', 'panel_filter']);
    } 
  }
);