import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { GlossaryEntry } from "src/models/glossary.js";

import { backgroundColor } from "src/core/color_defs.ts";

import { IconCheckmark } from "src/icons/icons.tsx";

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
                color={backgroundColor}
                width={10}
                height={10}
                svg_style={{ verticalAlign: "0.1px" }}
              />
            )}
            <span style={{ marginLeft: "5px" }}>{label}</span>
          </button>
          {GlossaryEntry.lookup(id) && (
            <span className="tag-button-helper" tabIndex="0">
              <GlossaryIcon id={id} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};
