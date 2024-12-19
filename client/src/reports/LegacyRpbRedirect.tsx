import React from "react";
import { useParams, Redirect } from "react-router-dom";

import { SafeJSURL } from "src/general_utils";

export const LegacyRpbRedirect = () => {
  const { config: encoded_config } = useParams<{ config?: string }>();

  const new_url = (() => {
    if (encoded_config !== undefined) {
      const config = SafeJSURL.parse(encoded_config);

      if (config && config?.table) {
        // TODO, use the eventual, new, rpb_link utility to construct redirects from options, rather than templating/hardcoding strings here
        return `/reports/builder/${config.table}`;
      }
      // TODO, see what other legacy config options will be mappable
    }

    return "/reports/picker";
  })();

  return <Redirect to={new_url} />;
};
