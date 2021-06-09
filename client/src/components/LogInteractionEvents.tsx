import _ from "lodash";
import React from "react";

import { log_standard_event } from "src/core/analytics";

interface LogInterationEventsProps {
  event_type: string;
  event_details: string;
  style: { display: string };
  children: React.ReactElement;
}

export const LogInteractionEvents: React.FC<LogInterationEventsProps> = ({
  event_type,
  event_details,
  style,
  children,
}) => {
  const log_event = _.debounce(
    (event) =>
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: _.isFunction(event_type) ? event_type(event) : event_type,
        MISC2: _.isFunction(event_details)
          ? event_details(event)
          : event_details,
      }),
    300
  );

  return (
    <div
      style={style}
      onClick={log_event}
      onKeyPress={(event) =>
        _.includes([13, 32], event.keyCode) && log_event(event)
      } // only care about enter or space, pressumed to be click equivalents
    >
      {children}
    </div>
  );
};
