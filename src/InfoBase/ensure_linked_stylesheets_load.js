import { log_standard_event } from '../core/analytics.js';

// Linked style sheets have a non null href property, and the only way to tell if they're loaded properly is to make sure their cssRules object has items
const linked_stylesheets_loaded = () => {
  try {
    const linked_style_sheets_have_loaded = _.every(
      document.styleSheets,
      (styleSheet) => !_.isNull(styleSheet.href) || styleSheet.cssRules.length !== 0
    );
    return linked_style_sheets_have_loaded;
  } catch (e) {
    // Some versions of FireFox throw a security error on accessing cssRules from a non-local styleSheet
    // No other good way to test that the sheets loaded, so have to assume they did in that case
    return true;
  }
}

// IE has an infrequent, unreproducable bug where it fails to load our linked stylesheets
// Rare, but happens within our team often enough that it must happen to users too (at least to other TBS employees, if it's caused by our own network)
// Collecting analytics on this event, hopefully that helps us pin it down eventually. Check GA for recent occurences before deleting any of this code!
// No decent fix, but reloading page seems to be enough when it happens within the team, so doing that programatically in prod
const ensure_linked_stylesheets_load = () => {

  if ( !linked_stylesheets_loaded() && !window.is_dev_build){
    log_standard_event({
      SUBAPP: window.location.hash.replace('#',''),
      MISC1: "ERROR_IN_PROD",
      MISC2: "Linked style sheets failed to load!",
    });

    window.location.reload();
  }
}

export { ensure_linked_stylesheets_load };