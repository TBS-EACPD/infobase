import _ from "lodash";
import React from "react";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { trivial_text_maker, create_text_maker } from "../models/text.js";

import text from "./footers.yaml";

const text_maker = create_text_maker(text);

const bonus_footer_links = text_maker("bonus_footer_links");

const footer_link_items = _.compact([
  {
    href: "#privacy",
    text: trivial_text_maker("privacy_title"),
  },
  !is_a11y_mode && {
    id: "footer-a11y-link",
    href: text_maker("a11y_version_url"),
    text: text_maker("a11y_version_title"),
  },
  is_a11y_mode && {
    id: "footer-standard-link",
    href: text_maker("standard_version_url"),
    text: text_maker("standard_version_title"),
  },
]);

export class InsertRuntimeFooterLinks extends React.Component {
  constructor() {
    super();
    this.state = {
      static_footer_links: document.querySelector("#footer_main_link_area")
        .innerHTML,
    };
  }
  render() {
    const bonus_footer_list = document.getElementById("bonus-footer-list-area");

    bonus_footer_list.innerHTML = bonus_footer_links;

    const footer_main_link_ul = document.querySelector(
      "#footer_main_link_area"
    );

    const links_to_insert = _.chain(footer_link_items)
      .map(
        ({ id, href, text }) =>
          `<li><a ${
            id ? `id="${id}"` : ""
          } href="${href}" target="_blank" rel="noopener noreferrer">${text}</a></li>`
      )
      .reduce(
        (memo, link_html) => memo + link_html,
        this.state.static_footer_links
      )
      .value();

    footer_main_link_ul.innerHTML = links_to_insert;

    return null;
  }
}
