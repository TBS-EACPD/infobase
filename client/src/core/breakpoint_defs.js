// Media breakpoint constants for use in the infobase. Should be kept in sync with _common-variables.scss
// These are global variables throughout the infobase. Modify with caution and keep in sync with ../common_css/_common-variables.scss!
// Media queries and other logic should default to min-width breakpoints for consistency with grid systems

// base breakpoints
const base_breakpoints = {
  extraSmallDevice: 576,
  smallDevice: 768,
  mediumDevice: 992,
  largeDevice: 1200,
};

// Note min breakpoints are -1
const breakpoints = {
  ..._.chain(base_breakpoints)
    .mapKeys( (value, key) => `min${_.upperFirst(key)}`)
    .value(),

  ..._.chain(base_breakpoints)
    .mapKeys( (value, key) => `max${_.upperFirst(key)}`)
    .mapValues( (value) => value-1)
    .value(),
};

const breakpoint_queries = {
  ..._.chain(base_breakpoints)
    .mapKeys( (value, key) => `min${_.upperFirst(key)}`)
    .mapValues( (value) => ((screen_width) => screen_width <= value) )
    .value(),

  ..._.chain(base_breakpoints)
    .mapKeys( (value, key) => `max${_.upperFirst(key)}`)
    .mapValues( (value) => ((screen_width) => screen_width >= value-1) )
    .value(),
};

export {
  breakpoints,
  breakpoint_queries,
};