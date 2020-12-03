import { sha } from "src/app_bootstrap/globals.js";
let initialized = false;

//tool to create totally random IDs
const uuid = function b(a) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
};

const dimensions = {
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

let client_id;
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
    client_id = tracker.get("clientId");
    tracker.set(dimensions.CLIENT_ID, client_id);
    tracker.set(dimensions.DEV, String(is_dev));
    tracker.set(dimensions.SHA, sha);

    const originalBuildHitTask = tracker.get("buildHitTask");
    tracker.set("buildHitTask", (model) => {
      model.set(dimensions.HIT_ID, uuid(), true);
      model.set(dimensions.HIT_TIME, String(+new Date()), true);
      model.set(dimensions.HIT_TYPE, model.get("hitType"), true);

      originalBuildHitTask(model);
    });
  });

  initialized = true;
}

//Google analytics doesnt do well with empty/null values for custom dimensions
//in order for data not to be clipped from reports and extracts, we have to make sure every dimension has a value for each event
const dummy_event_obj = _.chain(["SUBAPP", "SUBJECT_GUID", "MISC1", "MISC2"])
  .map((key) => [dimensions[key], "N/A"])
  .fromPairs()
  .value();

function log_standard_event(dims) {
  if (!initialized) {
    throw "analytics is uninitialized";
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

function log_page_view(page) {
  if (!initialized) {
    throw "analytics is uninitialized";
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
