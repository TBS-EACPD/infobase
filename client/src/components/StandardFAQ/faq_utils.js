import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import { Gov } from "src/models/organizational_entities";

export const faq_content_maker = (
  text_bundles,
  q_a_base_keys,
  subject = Gov
) => {
  const { TM } = create_text_maker_component(text_bundles);

  return _.map(q_a_base_keys, (base_text_key) => [
    <TM key={"q"} k={base_text_key + "_q"} args={{ subject }} />,
    <TM key={"a"} k={base_text_key + "_a"} args={{ subject }} />,
  ]);
};
