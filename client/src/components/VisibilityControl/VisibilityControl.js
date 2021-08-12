import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { lang } from "src/core/injected_build_constants";

import style_variables from "src/common_style_variables/common-variables.module.scss";

import { IconEyeOpen, IconEyeClosed } from "src/icons/icons";

import "./VisibilityControl.scss";

const { secondaryColor, tertiaryColor } = style_variables;

export class VisibilityControl extends React.Component {
  render() {
    const { items, item_component_order, click_callback, show_eyes_override } =
      this.props;

    const nothing_is_filtered = _.reduce(
      items,
      (memo, item) => memo && item.active,
      true
    );
    return (
      <div className="visibility-control">
        {_.map(items, (item) => {
          const item_components = {
            count: !_.isUndefined(item.count) && (
              <div className="visibility-control__count_area" key="count">
                <span className="visibility-control__count">{item.count}</span>
              </div>
            ),
            icon: !_.isUndefined(item.icon) && item.icon,
            text: !_.isUndefined(item.text) && (
              <div className="visibility-control__text" key="text">
                {item.text}
              </div>
            ),
          };

          return (
            <button
              aria-pressed={!item.is_filtered}
              onClick={() => click_callback(item.key)}
              className={classNames(
                "visibility-control__item",
                item.active && "visibility-control__item--active"
              )}
              key={item.key}
              aria-label={
                {
                  en: `Activate to filter "${item.aria_text}" items from the following presentation.`,
                  fr: `Appuyez pour filtrer les données «${item.aria_text}» de la présentation`,
                }[lang]
              }
            >
              <div
                className={classNames(
                  "visibility-control__eye",
                  item.active
                    ? "visibility-control__eye--open"
                    : "visibility-control__eye--closed"
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
              <div className="visibility-control__components">
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
