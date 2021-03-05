import _ from "lodash";
import React from "react";


import { HeightClipper } from "src/components/index.js";

import { trivial_text_maker } from "src/models/text.js";

import { infograph_href_template } from "src/link_utils.js";

export const related_tags_row = (related_tags, subject_type) => {
  const term =
    subject_type === "program"
      ? trivial_text_maker("related_tags_for_program")
      : trivial_text_maker("related_tags");

  const list_content = (
    <ul className="ExplorerNode__List">
      {_.map(related_tags, (related_tag) => (
        <li key={related_tag.id}>
          <a href={infograph_href_template(related_tag)}>{related_tag.name}</a>
        </li>
      ))}
    </ul>
  );
  const def =
    related_tags.length > 6 ? (
      <HeightClipper
        allowReclip={true}
        clipHeight={110}
        children={list_content}
      />
    ) : (
      list_content
    );

  return {
    term,
    def,
  };
};
