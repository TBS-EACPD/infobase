import _ from "lodash";
import React from "react";

import {
  TextPanel,
  general_utils,
  util_components,
  create_text_maker_component,
  infograph_href_template,
  Subject,
  formats,
  declare_panel,
} from "src/panels/panel_declarations/shared.js";

import text from "./profile_panels.yaml";

const { text_maker } = create_text_maker_component(text);
const { sanitized_dangerous_inner_html, generate_href } = general_utils;
const { LabeledTombstone, ExternalLink } = util_components;
const { Dept } = Subject;

export const declare_profile_panel = () =>
  declare_panel({
    panel_key: "profile",
    levels: ["dept", "crso", "program", "tag"],
    panel_config_func: (level, panel_key) => ({
      calculate: (subject) => {
        switch (level) {
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
                  ["inst_form", subject.type],
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
                    !_.isEmpty(subject.minister) &&
                      _.chain(subject.minister)
                        .flatMap((minister, ix) => [minister, <br key={ix} />])
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

          case "tag": {
            // Only for HI tags, at least for now
            if (
              subject.root.id === "HI" &&
              !_.isUndefined(subject.lookups) &&
              !_.isEmpty(subject.lookups)
            ) {
              const hi_lookups = subject.lookups || {};
              const lead_dept = Dept.lookup(hi_lookups.lead_dept);

              return {
                profile_fields: [
                  ["hi_name", subject.name],
                  [
                    "hi_lead_dept",
                    lead_dept && (
                      <a href={infograph_href_template(lead_dept)}>
                        {`${lead_dept.name} (${lead_dept.abbr})`}
                      </a>
                    ),
                  ],
                  ["hi_start_year", hi_lookups.start_year],
                  ["hi_end_year", hi_lookups.end_year],
                  [
                    "hi_total_allocated_amount",
                    hi_lookups.total_allocated_amount &&
                      formats.compact_raw(hi_lookups.total_allocated_amount, {
                        precision: 2,
                      }),
                  ],
                  [
                    "hi_website",
                    hi_lookups.website_url && (
                      <ExternalLink href={hi_lookups.website_url}>
                        {hi_lookups.website_url}
                      </ExternalLink>
                    ),
                  ],
                  [
                    "hi_dr_link",
                    hi_lookups.dr_url && (
                      <ExternalLink href={hi_lookups.dr_url}>
                        {hi_lookups.dr_url}
                      </ExternalLink>
                    ),
                  ],
                ],
              };
            } else {
              return false;
            }
          }

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
      render({ calculations }) {
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
          <TextPanel title={text_maker(`profile`)}>
            <LabeledTombstone labels_and_items={labels_and_items} />
          </TextPanel>
        );
      },
    }),
  });

export const declare_description_panel = () =>
  declare_panel({
    panel_key: "description",
    levels: ["tag"],
    panel_config_func: (level, panel_key) => ({
      footnotes: false,
      calculate: (subject) => !_.isEmpty(subject.description),
      render({ calculations }) {
        const { subject } = calculations;

        return (
          <TextPanel title={text_maker("tag_desc_title")}>
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
