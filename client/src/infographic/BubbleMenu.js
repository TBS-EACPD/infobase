import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { useQueryClient } from "react-query";

import { prefetchServices } from "src/models/react_query_services.js";

import { primaryColor, backgroundColor } from "src/core/color_defs.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { TM } from "../components/index.js";
import { trivial_text_maker } from "../models/text.js";

import "./BubbleMenu.scss";

const BubbleMenu = ({ items, active_item_id, subject }) => {
  const queryClient = useQueryClient();
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
          {_.map(items, ({ id, title, description, href, svg }) => (
            <a
              className={classNames(
                "centerer bubble-button",
                id === active_item_id && "active"
              )}
              href={href}
              key={id}
              onMouseEnter={() =>
                id === "services" && prefetchServices(queryClient, subject)
              }
            >
              <div className="bub-item">
                <strong className="title">{title}</strong>
                <div className="bub-svg" title={description}>
                  {(() => {
                    const SVG = svg;
                    return (
                      SVG && (
                        <SVG
                          alternate_color={false}
                          width="90%"
                          heigth="100%"
                          color={
                            id === active_item_id
                              ? backgroundColor
                              : primaryColor
                          }
                        />
                      )
                    );
                  })()}
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
