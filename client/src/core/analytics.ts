import _ from "lodash";

import { sha } from "src/core/injected_build_constants";
let initialized = false;

//tool to create totally random IDs
const uuid = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

const dimensions: { [key: string]: string } = {
  CLIENT_ID: "dimension1",
  HIT_ID: "dimension2",
  HIT_TIME: "dimension3",
  HIT_TYPE: "dimension4",
  SUBAPP: "dimension5",
  SUBJECT_GUID: "dimension6",
  MISC1: "dimension7",
  MISC2: "dimension8",
  DEV: "dimension9",
  SHA: "dimension16",
};

let client_id: string;
const get_client_id = () => {
  if (!initialized || _.isUndefined(client_id)) {
    /* eslint-disable-next-line no-console */
    console.error("Error: Google Analytics has not been initialized");
    return "uninitialized";
  } else {
    return client_id;
  }
};

function initialize_analytics() {
  const is_dev =
    String(window.location.hostname).indexOf("tbs-sct.gc.ca") === -1;

  ga("create", "UA-97024958-1", "auto");
  ga("set", "anonymizeIp", true);

  ga((tracker) => {
    if (tracker !== undefined) {
      client_id = tracker.get("clientId");
      tracker.set(dimensions.CLIENT_ID, client_id);
      tracker.set(dimensions.DEV, String(is_dev));
      tracker.set(dimensions.SHA, sha);

      const originalBuildHitTask = tracker.get("buildHitTask");
      tracker.set("buildHitTask", (model: UniversalAnalytics.Model) => {
        model.set(dimensions.HIT_ID, uuid(), true);
        model.set(dimensions.HIT_TIME, String(+new Date()), true);
        model.set(dimensions.HIT_TYPE, model.get("hitType"), true);

        originalBuildHitTask(model);
      });
    }
  });

  initialized = true;
}

//Google analytics doesnt do well with empty/null values for custom dimensions
//in order for data not to be clipped from reports and extracts, we have to make sure every dimension has a value for each event
const dummy_event_obj = _.chain(["SUBAPP", "SUBJECT_GUID", "MISC1", "MISC2"])
  .map((key) => [dimensions[key], "N/A"])
  .fromPairs()
  .value();

function log_standard_event(dims: { [key: string]: string }) {
  if (!initialized) {
    throw new Error("analytics is uninitialized");
  }

  const send_obj = {
    hitType: "event",
    eventCategory: "content-browse",
    eventAction: "content-browse",
    eventLabel: "content-browse",
    ...dummy_event_obj,
    ..._.chain(dims)
      .map((val, key) => [dimensions[key], val])
      .fromPairs()
      .value(),
  };

  ga("send", send_obj);
}

function log_page_view(page: string) {
  if (!initialized) {
    throw new Error("analytics is uninitialized");
  }

  ga("set", "page", page);
  ga("send", "pageview");
}

export {
  log_standard_event,
  log_page_view,
  initialize_analytics,
  get_client_id,
  dimensions,
};
