import React from "react";

import {
  create_text_maker_component,
  TextMaker as StandardTextMaker,
} from "src/components/index.js";
import footnote_topic_text from "../models/footnotes/footnote_topics.yaml";

import rpb_text from "./rpb.yaml";

export const { text_maker, TM } = create_text_maker_component([
  rpb_text,
  footnote_topic_text,
]);
export const TextMaker = (props) => (
  <StandardTextMaker text_maker_func={text_maker} {...props} />
);
