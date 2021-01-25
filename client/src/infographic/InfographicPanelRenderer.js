import _ from "lodash";
import React, { Fragment } from "react";

import { SelectAllControl } from "../charts/legends/index.js";

import {
  create_text_maker_component,
  Details,
  LabeledBox,
  TagCloud,
} from "../components/index.js";
import { tertiaryColor } from "../core/color_defs.js";
import { Table } from "../core/TableClass.js";
import { PanelRegistry } from "../panels/PanelRegistry.js";
import { PanelRenderer } from "../panels/PanelRenderer.js";

import text from "./InfographicPanelRenderer.yaml";

const { text_maker, TM } = create_text_maker_component(text);

export default class InfographicPanelRenderer extends React.Component {
  render() {
    const {
      subject,
      panel_keys,
      active_bubble_id,
      total_number_of_panels,
      panel_filter_by_table,
      set_panel_filter_by_table,
    } = this.props;

    const show_all_panels = !(
      active_bubble_id === "financial" || active_bubble_id === "people"
    );
    const is_panel_filter_empty = _.filter(panel_filter_by_table).length === 0;

    const { number_of_active_panels, panel_renderers } = _.reduce(
      panel_keys,
      (result, panel_key) => {
        const panel_obj = PanelRegistry.lookup(panel_key, subject.level);
        const active_panel_filter_keys = _.chain(panel_filter_by_table)
          .map((value, key) => value && key)
          .compact()
          .value();
        const filtered_keys = _.intersection(
          active_panel_filter_keys,
          panel_obj.depends_on
        );
        // Show the panel regardless of filter status if it's neither financial or people. Also if there is no panel filter applied.
        const is_panel_valid =
          show_all_panels || is_panel_filter_empty || filtered_keys.length > 0;

        // I think it makes sense to not include "static" panels (non table data panels) in showing number of active panels
        // But, always display them
        if (!panel_obj.static && is_panel_valid) {
          result.number_of_active_panels += 1;
        }
        if (panel_obj.static || is_panel_valid) {
          result.panel_renderers.push(
            <PanelRenderer
              panel_key={panel_key}
              subject={subject}
              active_bubble_id={active_bubble_id}
              key={panel_key + subject.guid}
            />
          );
        }
        return result;
      },
      {
        number_of_active_panels: 0,
        panel_renderers: [],
      }
    );

    const tags = _.map(panel_filter_by_table, (checked, dependency) => ({
      id: dependency,
      label: Table.lookup(dependency).name,
      active: checked,
    }));

    return (
      <Fragment>
        {!show_all_panels && (
          <Details
            summary_content={
              <div>
                <TM style={{ fontSize: 16 }} k="filter_panels" />
                <TM
                  className="panel-status-text"
                  k="panels_status"
                  args={{
                    number_of_active_panels,
                    total_number_of_panels,
                  }}
                />
              </div>
            }
            persist_content={true}
            content={
              <LabeledBox
                label={text_maker("filter_panels_description")}
                children={
                  <div>
                    <TagCloud
                      tags={tags}
                      onSelectTag={(evt) =>
                        set_panel_filter_by_table({
                          ...panel_filter_by_table,
                          [evt]: !panel_filter_by_table[evt],
                        })
                      }
                    />
                    <div
                      style={{
                        borderTop: `1px dashed ${tertiaryColor}`,
                        padding: "10px 0px 10px 5px",
                      }}
                    >
                      <SelectAllControl
                        SelectAllOnClick={() =>
                          set_panel_filter_by_table(
                            _.mapValues(panel_filter_by_table, () => true)
                          )
                        }
                        SelectNoneOnClick={() =>
                          set_panel_filter_by_table(
                            _.mapValues(panel_filter_by_table, () => false)
                          )
                        }
                      />
                    </div>
                  </div>
                }
              />
            }
          />
        )}
        {panel_renderers}
      </Fragment>
    );
  }
}
