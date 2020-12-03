import { newIBCategoryColors } from "../core/color_schemes.js";

import d3 from "./d3-bundle.js";

/* eslint-disable no-undef */
const lang =
  typeof APPLICATION_LANGUAGE !== "undefined" && APPLICATION_LANGUAGE;
const is_a11y_mode = typeof IS_A11Y_MODE !== "undefined" && IS_A11Y_MODE;
const long_sha = typeof SHA !== "undefined" && SHA;
const sha = typeof SHA !== "undefined" && SHA.substr(0, 7);
const previous_sha =
  typeof PREVIOUS_DEPLOY_SHA !== "undefined" &&
  PREVIOUS_DEPLOY_SHA.substr(0, 7);
const build_date = typeof BUILD_DATE !== "undefined" && BUILD_DATE;
const pre_public_accounts =
  typeof PRE_PUBLIC_ACCOUNTS !== "undefined" && PRE_PUBLIC_ACCOUNTS;
const cdn_url = typeof CDN_URL !== "undefined" && CDN_URL;
const is_dev_link = typeof IS_DEV_LINK !== "undefined" && IS_DEV_LINK;
const is_dev = typeof IS_DEV !== "undefined" && IS_DEV;
const local_ip = is_dev && typeof LOCAL_IP !== "undefined" && LOCAL_IP;
const is_ci = typeof IS_CI !== "undefined" && IS_CI;
const infobase_colors = (options) =>
  d3.scaleOrdinal().range(newIBCategoryColors);

export {
  lang,
  is_a11y_mode,
  long_sha,
  sha,
  previous_sha,
  build_date,
  pre_public_accounts,
  cdn_url,
  is_dev_link,
  is_dev,
  local_ip,
  is_ci,
  infobase_colors,
};
