import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text.js";

import { lang, is_a11y_mode } from "src/core/injected_build_constants.js";

import { index_lang_lookups } from "src/InfoBase/index_data.js";

const footer_link_items = _.compact([
  {
    href: "#privacy",
    text: trivial_text_maker("privacy_title"),
  },
  !is_a11y_mode && {
    id: "footer-a11y-link",
    href: index_lang_lookups.a11y_version_url[lang],
    text: index_lang_lookups.a11y_version_title[lang],
  },
  is_a11y_mode && {
    id: "footer-standard-link",
    href: index_lang_lookups.standard_version_url[lang],
    text: index_lang_lookups.standard_version_title[lang],
  },
]);

export class InsertRuntimeFooterLinks extends React.Component {
  constructor() {
    super();
    this.state = {
      static_footer_links: document.querySelector("#footer_survey_link_area")
        .innerHTML,
    };
  }
  render() {
    const footer_survey_link_ul = document.querySelector(
      "#footer_survey_link_area"
    );

    const links_to_insert = _(footer_link_items)
      .map(
        ({ id, href, text }) =>
          `<li><a ${
            id ? `id="${id}"` : ""
          } href="${href}" target="_blank" rel="noopener noreferrer">${text}</a></li>`
      )
      .reduce(
        (memo, link_html) => memo + link_html,
        this.state.static_footer_links
      );

    footer_survey_link_ul.innerHTML = links_to_insert;

    return null;
  }
}
