import React from "react";
import { withRouter } from "react-router";

import { shallowEqualObjectsOverKeys } from "../general_utils.js";

import { PanelRegistry } from "./PanelRegistry.js";

export const panel_context = React.createContext(null);

const PanelRenderer = withRouter(
  ({ subject, panel_key, history, active_bubble_id, data }) => {
    const panel_obj = PanelRegistry.lookup(panel_key, subject.level);

    const panel_options = { history };

    const { Provider } = panel_context;

    const calculations = panel_obj.calculate(subject, data, panel_options);

    if (!calculations) {
      return null;
    }
    return (
      <div id={panel_key} tabIndex="0">
        <Provider value={{ active_bubble_id, panel_key, subject }}>
          {panel_obj.render(calculations, data, panel_options)}
        </Provider>
      </div>
    );
  }
);

export default React.memo(PanelRenderer, (props, nextProps) => {
  return shallowEqualObjectsOverKeys(nextProps, props, [
    "subject",
    "panel_key",
  ]);
});
