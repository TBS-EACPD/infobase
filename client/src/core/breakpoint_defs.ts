import _ from "lodash";

// Media breakpoint constants for use in the infobase. Should be kept in sync with _common-variables.scss
// These are global variables throughout the infobase. Modify with caution and keep in sync with ../common_css/_common-variables.scss!
// Media queries and other logic should default to min-width breakpoints for consistency with grid systems

// base breakpoints
const base_breakpoints = {
  smallDevice: 576,
  mediumDevice: 768,
  largeDevice: 992,
  extraLargeDevice: 1200,
};

// Note max breakpoints are base breakpoints -0.02
const breakpoints = {
  ..._.chain(base_breakpoints)
    .mapKeys((_value, key) => `min${_.upperFirst(key)}`)
    .value(),

  ..._.chain(base_breakpoints)
    .mapKeys((_value, key) => `max${_.upperFirst(key)}`)
    .mapValues((value) => value - 0.02)
    .value(),
};

export { breakpoints };
