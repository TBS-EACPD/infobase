import { IconQuestion } from '../icons/icons.js';
import { GlossaryEntry } from '../models/glossary.js';
import { glossary_href } from '../link_utils.js';
import { trivial_text_maker } from '../models/text.js';

const GlossaryTooltipItem = ({id, arrow_selector, inner_selector, children}) => (
  <a
    href={ window.is_a11y_mode ? glossary_href(id) : null}
    title={ window.is_a11y_mode ? trivial_text_maker("glossary_link_title") : null}
    className="tag-glossary-item"
    data-toggle="tooltip"
    data-ibtt-glossary-key={id}
    data-ibtt-html="true"
    data-ibtt-arrowselector={arrow_selector ? arrow_selector : null}
    data-ibtt-innerselector={inner_selector ? inner_selector : null}
  >
    {children}
  </a>
);

export const GlossaryIcon = ({id, alternate_text, arrow_selector, inner_selector, icon_color, icon_alt_color}) => (
  <GlossaryTooltipItem
    id={id}
    arrow_selector={arrow_selector}
    inner_selector={inner_selector}
  >
    {
      window.is_a11y_mode ?
        alternate_text ? alternate_text : GlossaryEntry.lookup(id).title
      :
        <IconQuestion
          color={icon_color ? icon_color : window.infobase_color_constants.backgroundColor}
          width={"1.2em"}
          alternate_color={icon_alt_color ? icon_alt_color : window.infobase_color_constants.primaryColor}
          vertical_align={"-0.3em"}
        />
    }
  </GlossaryTooltipItem>
);

export const GlossaryLink = ({id, alternate_text, item_class, arrow_selector, inner_selector}) => (
  <GlossaryTooltipItem
    id={id}
    arrow_selector={arrow_selector}
    inner_selector={inner_selector}
  >
    <span className={item_class}>
      {alternate_text ? alternate_text : GlossaryEntry.lookup(id).title}
    </span>
  </GlossaryTooltipItem>
);

