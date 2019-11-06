import { IconQuestion } from '../icons/icons.js';
import { GlossaryEntry } from '../models/glossary.js';
import { glossary_href } from '../link_utils.js'

export const GlossaryIcon = ({id, alternate_text, arrow_selector, inner_selector, icon_color, icon_alt_color}) => (
  ( window.is_a11y_mode || window.feature_detection.is_mobile() ) ?
  <a href={glossary_href(id)}>{alternate_text || GlossaryEntry.lookup(id).title}</a> :
  <span
    className="tag-glossary-item"
    aria-hidden="true"
    tabIndex="0"
    data-toggle="tooltip"
    data-ibtt-glossary-key={id}
    data-ibtt-html="true"
    data-ibtt-arrowselector={arrow_selector ? arrow_selector : null}
    data-ibtt-innerselector={inner_selector ? inner_selector : null}
  >
    <IconQuestion
      color={icon_color ? icon_color : window.infobase_color_constants.backgroundColor}
      width={"1.2em"}
      alternate_color={icon_alt_color ? icon_alt_color : window.infobase_color_constants.primaryColor}
      vertical_align={"-0.3em"}
    />
  </span>
);



