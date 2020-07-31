// Colour constants for use in the infobase. Should be kept in sync with _common-variables.scss
// These are global variables throughout the infobase. Modify with caution!!!

const primaryColor = "#26374A";
const secondaryColor = "#2C70C9";
const tertiaryColor =
  "#8c949e"; /* this one is used lots at varying alpha/darkness levels, should stay grey */

const backgroundColor = "#fff";
const highlightColor = "#da3a38";
const separatorColor = "#bbc1c9";

const highlightPale = "#ffa8a8";
const highlightOrangeColor = "#e89a40";
const highlightDark = "#B12320";

const tooltipColor = primaryColor;

const buttonPrimaryColor = "#176dde";
const buttonSecondaryColor = "#76a4df";

const textColor = "#333";
const textLightColor = "#fff";
const textGreen = "#008000";
const textRed = "#cc0000";

const linkColor = "#2b438c";
const linkFocusColor = "#0535d2";
const linkVisitedColor = "#7834bc";

/* dark and light colours don't have enough contrast between them for text, so don't use them that way! Use black text on light, or (check contrast) white text on dark*/
const successLightColor = "#cbedbd";
const successDarkColor = "#45a64d";
const failLightColor = highlightDark;
const failDarkColor = highlightColor; // setting this to so we don't have too many shades of red, if the buttons change colour this should be changed
const warnLightColor = "#ffecce";
const warnDarkColor = "#fdb84c";
const infoLightColor = "#f2f6fc";
const infoDarkColor = buttonPrimaryColor; // setting this to so we don't have too many shades of blue, if the buttons change colour this should be set to a nice "info" blue

export {
  primaryColor,
  secondaryColor,
  tertiaryColor,
  backgroundColor,
  highlightColor,
  highlightPale,
  highlightOrangeColor,
  highlightDark,
  separatorColor,
  tooltipColor,
  buttonPrimaryColor,
  buttonSecondaryColor,
  textColor,
  textLightColor,
  textGreen,
  textRed,
  linkColor,
  linkFocusColor,
  linkVisitedColor,
  successLightColor,
  successDarkColor,
  failLightColor,
  failDarkColor,
  warnLightColor,
  warnDarkColor,
  infoLightColor,
  infoDarkColor,
};
