/* eslint-disable no-undef */
export const is_a11y_mode = typeof IS_A11Y_MODE !== "undefined" && IS_A11Y_MODE;

export const is_dev_link = typeof IS_DEV_LINK !== "undefined" && IS_DEV_LINK;

export const is_dev = typeof IS_DEV !== "undefined" && IS_DEV;

export const is_ci = typeof IS_CI !== "undefined" && IS_CI;

export const lang: LangType =
  (typeof APPLICATION_LANGUAGE !== "undefined" && APPLICATION_LANGUAGE) || "en";

export const long_sha = typeof SHA !== "undefined" && SHA;

export const sha = typeof SHA !== "undefined" && SHA.substr(0, 7);

export const previous_sha =
  typeof PREVIOUS_DEPLOY_SHA !== "undefined" &&
  PREVIOUS_DEPLOY_SHA.substr(0, 7);

export const build_date = typeof BUILD_DATE !== "undefined" && BUILD_DATE;

export const cdn_url = typeof CDN_URL !== "undefined" && CDN_URL;

export const local_ip = is_dev && typeof LOCAL_IP !== "undefined" && LOCAL_IP;

export const services_feature_flag = true;
