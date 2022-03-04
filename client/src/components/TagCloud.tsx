import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { glossaryEntryStore } from "src/models/glossary";

import { IconCheckmark } from "src/icons/icons";
import { backgroundColor } from "src/style_constants/index";

import { GlossaryIcon } from "./glossary_components";

import "./TagCloud.scss";

interface ProgramTag {
  active: boolean;
  id: string;
  label: string;
}

interface TagCloudProps {
  tags: ProgramTag[];
  onSelectTag: (parameter?: string) => void;
}

export const TagCloud = ({ tags, onSelectTag }: TagCloudProps) => (
  <ul className="tag-cloud-main">
    {_.map(tags, ({ id, active, label }) => (
      <li key={id} className={classNames(active && "active")}>
        <button
          role="checkbox"
          aria-checked={!!active}
          onClick={() => onSelectTag(id)}
        >
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
        {glossaryEntryStore.has(id) && (
          <span className="tag-button-helper">
            <GlossaryIcon id={id} icon_alt_color={false} />
          </span>
        )}
      </li>
    ))}
  </ul>
);
