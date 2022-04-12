import React from "react";
import { withRouter } from "react-router";

import { shallowEqualObjectsOverKeys } from "src/general_utils";

import { PanelRegistry } from "./PanelRegistry";

export const panel_context = React.createContext(null);

export const PanelRenderer = withRouter(
  class PanelRenderer_ extends React.Component {
    render() {
      let { subject, panel_key, history, active_bubble_id } = this.props;

      const panel_options = { history };

      const { Provider } = panel_context;

      const panel = PanelRegistry.lookup(panel_key, subject.subject_type);

      if (!panel.is_panel_valid_for_subject(subject)) {
        return null;
      }

      return (
        <div id={panel_key}>
          <Provider
            value={{
              active_bubble_id,
              panel_key,
              subject,
            }}
          >
            {panel.render(subject, panel_options)}
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
