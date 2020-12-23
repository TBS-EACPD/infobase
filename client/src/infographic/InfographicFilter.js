import { SelectAllControl } from "../charts/legends/index.js";

import {
  create_text_maker_component,
  Details,
  LabeledBox,
  TagCloud,
} from "../components/index.js";
import { Table } from "../core/TableClass.js";

import footnote_topics_text from "../models/footnotes/footnote_topics.yaml";

import text from "./InfographicFilter.yaml";

const { text_maker, TM } = create_text_maker_component([
  text,
  footnote_topics_text,
]);

export default class InfographicFilter extends React.Component {
  render() {
    const {
      number_of_active_panels,
      total_number_of_panels,
      panel_filter_by_table,
      set_panel_filter_by_table,
      panel_filter_by_footnotes,
      set_panel_filter_by_footnotes,
    } = this.props;

    const table_tags = _.map(panel_filter_by_table, (checked, dependency) => ({
      id: dependency,
      label: Table.lookup(dependency).name,
      active: checked,
    }));
    const footnotes_tags = _.map(
      panel_filter_by_footnotes,
      (checked, topic_key) => ({
        id: topic_key,
        label: text_maker(topic_key),
        active: checked,
      })
    );
    const infographic_filter_controls = [
      {
        label: text_maker("filter_by_datasets"),
        tags: table_tags,
        set_panel_filter: set_panel_filter_by_table,
        panel_filter: panel_filter_by_table,
      },
      {
        label: text_maker("filter_by_footnotes"),
        tags: footnotes_tags,
        set_panel_filter: set_panel_filter_by_footnotes,
        panel_filter: panel_filter_by_footnotes,
      },
    ];

    return (
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
          <div>
            {_.map(
              infographic_filter_controls,
              ({ label, tags, set_panel_filter, panel_filter }) => (
                <LabeledBox
                  label={label}
                  key={label}
                  children={
                    <div>
                      <TagCloud
                        tags={tags}
                        onSelectTag={(evt) =>
                          set_panel_filter({
                            ...panel_filter,
                            [evt]: !panel_filter[evt],
                          })
                        }
                      />
                      <div
                        style={{
                          borderTop: `1px dashed ${window.infobase_color_constants.tertiaryColor}`,
                          padding: "10px 0px 10px 5px",
                        }}
                      >
                        <SelectAllControl
                          SelectAllOnClick={() =>
                            set_panel_filter(
                              _.mapValues(panel_filter, () => true)
                            )
                          }
                          SelectNoneOnClick={() =>
                            set_panel_filter(
                              _.mapValues(panel_filter, () => false)
                            )
                          }
                        />
                      </div>
                    </div>
                  }
                />
              )
            )}
          </div>
        }
      />
    );
  }
}
