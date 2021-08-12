import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { TM } from "src/components/index";

import { trivial_text_maker } from "src/models/text";

import { is_a11y_mode } from "src/core/injected_build_constants";

import {
  primaryColor,
  backgroundColor,
} from "src/common_style_variables/common-variables.module.scss";

import "./BubbleMenu.scss";

const BubbleMenu = ({ items, active_item_id }) => {
  if (is_a11y_mode) {
    return (
      <nav aria-label={trivial_text_maker("dataset_navigation")}>
        <ul>
          {_.map(items, ({ id, title, description, href }) => (
            <li key={id}>
              <a
                onClick={() =>
                  document
                    .getElementById("infographic-explanation-focus")
                    .focus()
                }
                href={href}
              >
                {title}
                {id === active_item_id && (
                  <span>
                    - <TM k="you_are_here" />
                  </span>
                )}
              </a>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </nav>
    );
  } else {
    return (
      <div style={{ position: "relative" }}>
        <nav className="bubble-menu">
          {_.map(items, ({ id, title, description, href, Icon }) => (
            <a
              className={classNames(
                "centerer bubble-button",
                id === active_item_id && "active"
              )}
              href={href}
              key={id}
            >
              <div className="bub-item">
                <strong className="title">{title}</strong>
                <div className="bub-svg" title={description}>
                  {Icon && (
                    <Icon
                      alternate_color={false}
                      width="90%"
                      heigth="100%"
                      color={
                        id === active_item_id ? backgroundColor : primaryColor
                      }
                    />
                  )}
                </div>
              </div>
            </a>
          ))}
        </nav>
      </div>
    );
  }
};

export { BubbleMenu };
