//tool to create totally random IDs
const uuid = function b(a) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) :
      ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
};

let initialized = false;

const dimensions = {
  CLIENT_ID: 'dimension1', 
  HIT_ID: 'dimension2',
  HIT_TIME: 'dimension3',
  HIT_TYPE: 'dimension4',
  SUBAPP: 'dimension5',
  SUBJECT_GUID: 'dimension6',
  MISC1: "dimension7",
  MISC2: "dimension8",
  DEV: "dimension9",
};

const is_dev = String(window.location.hostname).indexOf("tbs-sct.gc.ca") === -1;

function initialize_analytics(){
  ga('create', 'UA-97024958-1', 'auto');
  ga('set', 'anonymizeIp', true);

  ga(tracker => {

    const client_id = tracker.get("clientId");   
    tracker.set(dimensions.CLIENT_ID, client_id);
    tracker.set(dimensions.DEV, String(is_dev))

    const originalBuildHitTask = tracker.get('buildHitTask');
    tracker.set("buildHitTask", model => {

      model.set(dimensions.HIT_ID, uuid(), true);
      model.set(dimensions.HIT_TIME, String(+new Date), true);
      model.set(dimensions.HIT_TYPE, model.get('hitType'), true);

      originalBuildHitTask(model);
    });

  });

  initialized = true;
  
};

//Google analytics doesnt do well with empty/null values for custom dimensions
//in order for data not to be clipped from reports and extracts, we have to make sure every dimension has a value for each event
const dummy_event_obj = _.chain([
  'SUBAPP',
  'SUBJECT_GUID',
  'MISC1',
  'MISC2',
])
  .map( key => [ dimensions[key], 'N/A' ] )
  .fromPairs()
  .value();

function log_standard_event(dims){
  if(!initialized){ 
    return; 
  }

  const send_obj = Object.assign(
    {
      hitType: 'event',
      eventCategory: 'content-browse',
      eventAction: 'content-browse',
      eventLabel: 'content-browse',
    },
    dummy_event_obj,  
    _.chain(dims)
      .map( (val, key) => [
        dimensions[key],
        val,
      ])
      .fromPairs()
      .value()
  );


  ga('send',send_obj);

}


function log_page_view(page){
  if(!initialized){ 
    return; 
  }

  ga('set', 'page', page);
  ga('send', 'pageview');
}

module.exports = { 
  log_page_view,
  dimensions,
  log_standard_event,
  initialize_analytics,
}; 
