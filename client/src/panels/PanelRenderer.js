import React from "react";
import { withRouter } from "react-router";

import { shallowEqualObjectsOverKeys } from "src/general_utils.js";

import { PanelRegistry } from "./PanelRegistry.js";

export const panel_context = React.createContext(null);

export const PanelRenderer = withRouter(
  class PanelRenderer_ extends React.Component {
    render() {
      let {
        subject,
        panel_key,
        history,
        active_bubble_id,
        add_visible_panel_title,
        remove_visible_panel_title,
      } = this.props;

      const panel_obj = PanelRegistry.lookup(panel_key, subject.level);

      const panel_options = { history };

      const { Provider } = panel_context;

      const calculations = panel_obj.calculate(subject, panel_options);

      if (!calculations) {
        return null;
      }
      return (
        <div id={panel_key} tabIndex="0">
          <Provider
            value={{
              active_bubble_id,
              panel_key,
              subject,
              add_visible_panel_title,
              remove_visible_panel_title,
            }}
          >
            {panel_obj.render(calculations, panel_options)}
          </Provider>
        </div>
      );
    }
    shouldComponentUpdate(nextProps) {
      return !shallowEqualObjectsOverKeys(nextProps, this.props, [
        "subject",
        "panel_key",
      ]);
    }
  }
);
