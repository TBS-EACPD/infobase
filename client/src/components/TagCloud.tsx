import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { GlossaryEntry } from "src/models/glossary";

import { backgroundColor } from "src/core/color_defs";

import { IconCheckmark } from "src/icons/icons";

import { GlossaryIcon } from "./glossary_components";

import "./TagCloud.scss";

interface Tag {
  active: boolean;
  id: string;
  label: string;
}

interface TagCloudProps {
  tags: Tag[];
  onSelectTag: (parameter?: string) => void;
}

export const TagCloud: React.FC<TagCloudProps> = ({ tags, onSelectTag }) => (
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
          <span className="tag-button-helper" tabIndex={0}>
            <GlossaryIcon id={id} />
          </span>
        )}
      </li>
    ))}
  </ul>
);
