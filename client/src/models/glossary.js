import _ from "lodash";

import { sanitized_marked } from "../general_utils.js";

import { mix, staticStoreMixin } from "./storeMixins.js";
import { trivial_text_maker } from "./text.js";

class GlossaryEntry extends mix().with(staticStoreMixin) {
  constructor(id, title, def_text, translation) {
    super();
    this.id = id;
    this.title = title;
    this._def_text = def_text;
    this.translation = translation;
  }
  get definition() {
    /* eslint-disable-next-line no-use-before-define */
    return compiled_definitions(this.id);
  }
  static query(query) {
    return super.query(query);
  }
}

const compiled_definitions = _.memoize((glossary_id) =>
  sanitized_marked(GlossaryEntry.lookup(glossary_id)._def_text)
);

const glossary_display = (item) => `<div>
  <div class="h6 medium-weight"> ${trivial_text_maker("definition")} : ${
  item.title
} </div>
  <div>${item.definition}</div>
</div>`;

const get_glossary_item_tooltip_html = (key) =>
  glossary_display(GlossaryEntry.lookup(key));

window.__DEV.GlossaryEntry = GlossaryEntry;

export { GlossaryEntry, get_glossary_item_tooltip_html };
