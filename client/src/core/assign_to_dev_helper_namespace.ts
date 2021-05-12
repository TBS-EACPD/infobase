import { is_dev, is_dev_link } from "./injected_build_constants";

const assign_to_dev_helper_namespace = (dev_helpers: Object) => {
  if (!(is_dev || is_dev_link)) {
    return null;
  }

  if (!window.__DEV) {
    window.__DEV = {};
  }

  Object.assign(window.__DEV, dev_helpers);
};

export { assign_to_dev_helper_namespace };
