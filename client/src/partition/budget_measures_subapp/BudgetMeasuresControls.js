import "./BudgetMeasuresControls.scss";

import { text_maker, TextMaker } from "./budget_measure_text_provider.js";
import {
  LabeledBox,
  RadioButtons,
  DebouncedTextInput,
} from "../../components/index.js";

import { businessConstants } from "../../models/businessConstants.js";

const { budget_values } = businessConstants;

const budget_value_options = [
  {
    id: "overview",
    display: text_maker("funding_overview"),
  },
  ..._.map(budget_values, (value, key) => ({ id: key, display: value.text })),
];

export class BudgetMeasuresControls extends React.Component {
  constructor() {
    super();
  }
  render() {
    const {
      selected_value,
      first_column,
      budget_year,
      history,
      group_by_items,
      filter_string,
      setFilterString,
    } = this.props;

    const update_filter_string = (filter_string) => {
      if (filter_string === "") {
        setFilterString(false);
      } else {
        setFilterString(filter_string);
      }
    };

    return (
      <div className="budget-measures-partition-controls">
        <LabeledBox
          label={<TextMaker text_key="budget_measure_display_value_label" />}
        >
          <div className="centerer">
            <RadioButtons
              options={_.map(budget_value_options, ({ id, display }) => ({
                id,
                display,
                active: id === selected_value,
              }))}
              onChange={(id) => {
                const new_path = `/budget-tracker/${first_column}/${id}/${budget_year}`;
                if (history.location.pathname !== new_path) {
                  // the first_column prop, and thus this button's active id, is updated through this route push
                  history.push(new_path);
                }
              }}
            />
          </div>
        </LabeledBox>
        {selected_value !== "overview" && (
          <LabeledBox
            label={<TextMaker text_key="budget_measure_group_by_label" />}
          >
            <div className="centerer">
              <RadioButtons
                options={_.map(group_by_items, ({ id, display }) => ({
                  id,
                  display,
                  active: id === first_column,
                }))}
                onChange={(id) => {
                  const new_path = `/budget-tracker/${id}/${selected_value}/${budget_year}`;
                  if (history.location.pathname !== new_path) {
                    // the first_column prop, and thus this button's active id, is updated through this route push
                    history.push(new_path);
                  }
                }}
              />
            </div>
          </LabeledBox>
        )}
        <LabeledBox
          label={<TextMaker text_key="budget_measure_filter_by_label" />}
        >
          <div>
            <div className="centerer" style={{ fontSize: "26px" }}>
              <TextMaker text_key="budget_measure_filter_by_name_and_desc_label" />
            </div>
            <div className="budget-measures-search-box">
              <DebouncedTextInput
                additionalInputClasses={"search input-lg"}
                a11y_label={text_maker(
                  "budget_measure_filter_by_name_and_desc_a11y_label"
                )}
                placeHolder={text_maker(
                  "budget_measure_filter_by_name_and_desc_placeholder"
                )}
                defaultValue={filter_string}
                updateCallback={update_filter_string.bind(this)}
              />
            </div>
          </div>
        </LabeledBox>
      </div>
    );
  }
}
