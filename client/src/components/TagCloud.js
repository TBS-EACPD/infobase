import classNames from "classnames";

import { IconCheckmark } from "../icons/icons.js";
import { GlossaryEntry } from "../models/glossary.js";

import { GlossaryIcon } from "./glossary_components.js";

import "./TagCloud.scss";

export const TagCloud = ({ tags, onSelectTag }) => {
  return (
    <ul className="tag-cloud-main">
      {_.map(tags, ({ id, active, label }) => (
        <li
          key={id}
          className={classNames(active && "active")}
          onClick={() => onSelectTag(id)}
        >
          <button role="checkbox" aria-checked={!!active}>
            {active && (
              <IconCheckmark
                color={window.infobase_color_constants.backgroundColor}
                width={10}
                height={10}
                vertical_align={0.1}
              />
            )}
            <span style={{ marginLeft: "5px" }}>{label}</span>
          </button>
          {GlossaryEntry.lookup(id) && (
            <span className="tag-button-helper" tabIndex="0">
              <GlossaryIcon
                id={id}
                inner_selector={"TablePicker__tooltip-inner"}
                arrow_selector={"TablePicker__tooltip-arrow"}
              />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};
