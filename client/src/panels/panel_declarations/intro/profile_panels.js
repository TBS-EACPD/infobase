import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  create_text_maker_component,
  LabeledTombstone,
  ExternalLink,
} from "src/components/index";

import * as general_utils from "src/general_utils";

import text from "./profile_panels.yaml";

const { text_maker } = create_text_maker_component(text);
const { sanitized_dangerous_inner_html, generate_href } = general_utils;

export const declare_profile_panel = () =>
  declare_panel({
    panel_key: "profile",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: (subject_type, panel_key) => ({
      title: text_maker(`profile`),
      calculate: (subject) => {
        switch (subject_type) {
          case "dept":
            return (
              subject.id && {
                profile_fields: [
                  ["applied_title", subject.applied_title],
                  ["legal_title", subject.legal_title],
                  ["acronym", subject.abbr],
                  ["previously_named", subject.old_name],
                  ["status", subject.status],
                  ["end_yr", subject.end_yr],
                  ["notes", subject.notes],
                  ["incorp_yr", subject.incorp_yr],
                  ["inst_form", subject.inst_form.name],
                  [
                    "website",
                    !subject.is_dead && subject.website_url && (
                      <ExternalLink href={generate_href(subject.website_url)}>
                        {subject.website_url}
                      </ExternalLink>
                    ),
                  ],
                  [
                    "eval_links",
                    !subject.is_dead && subject.eval_url && (
                      <ExternalLink href={generate_href(subject.eval_url)}>
                        {subject.eval_url}
                      </ExternalLink>
                    ),
                  ],
                  [
                    "minister",
                    !_.isEmpty(subject.ministers) &&
                      _.chain(subject.ministers)
                        .flatMap((minister, ix) => [
                          minister.name,
                          <br key={ix} />,
                        ])
                        .dropRight()
                        .value(),
                  ],
                  [
                    "mandate",
                    subject.mandate && (
                      <div
                        dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                          subject.mandate
                        )}
                      />
                    ),
                  ],
                  ["legislation", subject.legislation],
                  ["fiscal_end_yr", subject.fiscal_end_yr],
                  ["auditor", subject.auditor],
                  ["fed_ownership", subject.fed_ownership],
                  ["board_comp", subject.board_comp],
                  ["inst_faa", subject.schedule],
                  ["hr_faa", subject.faa_hr],
                  ["pas_code", subject.pas_code],
                ],
              }
            );

          case "crso":
          case "program":
            return (
              subject.id && {
                profile_fields: [
                  ["name", subject.name],
                  ["status", subject.status],
                  ["previously_named", subject.old_name],
                  [
                    "description",
                    subject.description && (
                      <div
                        dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                          subject.description
                        )}
                      />
                    ),
                  ],
                  ["activity_code", subject.activity_code],
                ],
              }
            );

          default:
            return false;
        }
      },
      render({ title, calculations }) {
        const { profile_fields } = calculations.panel_args;

        const labels_and_items = _.chain(profile_fields)
          .map(([label_key, item]) => {
            const label =
              label_key !== "legislation" ? ( // legislation text contains markup (to fix a confusing line break), needs to be rendered through innerHTML
                text_maker(label_key)
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: text_maker(label_key) }}
                />
              );

            return [label, item];
          })
          .filter(([label, item]) => item)
          .value();

        return (
          <TextPanel title={title}>
            <LabeledTombstone labels_and_items={labels_and_items} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_description_panel = () =>
  declare_panel({
    panel_key: "description",
    subject_types: ["tag"],
    panel_config_func: (subject_type, panel_key) => ({
      footnotes: false,
      calculate: (subject) => !_.isEmpty(subject.description),
      title: text_maker("tag_desc_title"),
      render({ title, calculations }) {
        const { subject } = calculations;

        return (
          <TextPanel title={title}>
            <div
              dangerouslySetInnerHTML={sanitized_dangerous_inner_html(
                subject.description
              )}
            />
          </TextPanel>
        );
      },
    }),
  });
