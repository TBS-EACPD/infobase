import classNames from "classnames";
import React from "react";

import { secondaryColor, tertiaryColor } from "src/core/color_defs.js";

import { lang } from "src/app_bootstrap/globals.js";

import { IconEyeOpen, IconEyeClosed } from "../icons/icons.js";

import "./FilterTable.scss";

export class FilterTable extends React.Component {
  render() {
    const {
      items,
      item_component_order,
      click_callback,
      show_eyes_override,
    } = this.props;

    const nothing_is_filtered = _.reduce(
      items,
      (memo, item) => memo && item.active,
      true
    );
    return (
      <div className="filter-table">
        {_.map(items, (item) => {
          const item_components = {
            count: !_.isUndefined(item.count) && (
              <div className="filter-table__count_area" key="count">
                <span className="filter-table__count">{item.count}</span>
              </div>
            ),
            icon: !_.isUndefined(item.icon) && item.icon,
            text: !_.isUndefined(item.text) && (
              <div className="filter-table__text" key="text">
                {item.text}
              </div>
            ),
          };

          return (
            <button
              aria-pressed={!item.is_filtered}
              onClick={() => click_callback(item.key)}
              className={classNames(
                "filter-table__item",
                item.active && "filter-table__item--active"
              )}
              key={item.key}
              aria-label={
                {
                  en: `Activate to filter "${item.text}" items from the following presentation.`,
                  fr: `Appuyez pour filtrer les données «${item.text}» de la présentation`,
                }[lang]
              }
            >
              <div
                className={classNames(
                  "filter-table__eye",
                  item.active
                    ? "filter-table__eye--open"
                    : "filter-table__eye--closed"
                )}
                aria-hidden="true"
                style={{
                  visibility:
                    !nothing_is_filtered || show_eyes_override
                      ? "visible"
                      : "hidden",
                }}
              >
                {item.active ? (
                  <IconEyeOpen
                    color={secondaryColor}
                    alternate_color={false}
                    width={"40px"}
                  />
                ) : (
                  <IconEyeClosed
                    color={tertiaryColor}
                    alternate_color={false}
                    width={"40px"}
                  />
                )}
              </div>
              <div className="filter-table__components">
                {_.map(
                  item_component_order,
                  (component) => item_components[component]
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }
}
