import "./FootnoteList.scss";

import { sanitized_dangerous_inner_html } from "../general_utils.js";

import { FancyUL } from "./misc_util_components.js";

const FootnoteList = ({ footnotes }) => (
  <div className={"footnote-list"}>
    <FancyUL>
      {_.chain(footnotes)
        .uniqBy("text")
        .map(({ text }, ix) => (
          <div
            className={"footnote-list__note"}
            key={ix}
            dangerouslySetInnerHTML={sanitized_dangerous_inner_html(text)}
          />
        ))
        .value()}
    </FancyUL>
  </div>
);

export { FootnoteList };
