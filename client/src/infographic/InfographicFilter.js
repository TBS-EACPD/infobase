import { SelectAllControl } from "../charts/legends/index.js";

import {
  create_text_maker_component,
  Details,
  LabeledBox,
  TagCloud,
} from "../components/index.js";
import { Table } from "../core/TableClass.js";

import text from "./Infographic.yaml";

const { text_maker, TM } = create_text_maker_component(text);

export default class InfographicFilter extends React.Component {
  render() {
    const {
      number_of_active_panels,
      total_number_of_panels,
      panel_filter_by_table,
      set_panel_filter_by_table,
    } = this.props;

    const tags = _.map(panel_filter_by_table, (checked, dependency) => ({
      id: dependency,
      label: Table.lookup(dependency).name,
      active: checked,
    }));

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
                    borderTop: `1px dashed ${window.infobase_color_constants.tertiaryColor}`,
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
    );
  }
}
