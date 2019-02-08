import { StandardRouteContainer } from '../core/NavComponents.js';
import {
  Format,
  TM,
  SpinnerWrapper,
  LabeledBox,
  RadioButtons
} from '../util_components.js';
import { get_data } from './data.js';
import { formats } from '../core/format.js';
import './TreeMap.scss';
import { TreeMap } from './visualization.js';
import AriaModal from 'react-aria-modal';
import { IndicatorDisplay } from '../panels/result_graphs/components.js'
import { infograph_href_template } from '../link_utils.js';
import {
  trivial_text_maker,
  run_template
} from '../models/text.js';
import treemap_text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';

const text_maker = create_text_maker([treemap_text]);

const years = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  "pa_last_year",
  "planning_year_1",
  "planning_year_2",
  "planning_year_3",
];

const size_controls = [
  { id: "drf", display: "DRF" },
  { id: "tp", display: "TP" },
  { id: "vote_stat", display: "Voted/stat" },
]
const color_controls = [
  { id: "spending", display: "Spending" },
  { id: "ftes", display: "FTEs" },
]

export class TreeMapControls extends React.Component {
  constructor() {
    super();
  }
  render() {
    const {
      perspective,
      color_var,
      year,
      history,
    } = this.props;
    return (
      <div>
        <LabeledBox
          label={text_maker("treemap_display_value_label")}
          content={
            <div>
              <RadioButtons
                options={_.map(size_controls, ({ id, display }) => ({ id, display, active: id === perspective }))}
                onChange={id => {
                  const new_path = `/treemap/${id}/${color_var}/${year}`;
                  if (history.location.pathname !== new_path) {
                    // the first_column prop, and thus this button's active id, is updated through this route push
                    history.push(new_path);
                  }
                }}
              />
            </div>
          }
        />
        {perspective === "drf" &&
          <LabeledBox
            label={text_maker("treemap_color_by_label")}
            content={
              <div>
                <RadioButtons
                  options={_.map(color_controls, ({ id, display }) => ({ id, display, active: id === color_var }))}
                  onChange={id => {
                    const new_path = `/treemap/${perspective}/${id}/${year}`;
                    if (history.location.pathname !== new_path) {
                      // the first_column prop, and thus this button's active id, is updated through this route push
                      history.push(new_path);
                    }
                  }}
                />
              </div>
            }
          />
        }
        <LabeledBox
          label={text_maker("year")}
          content={
            <div>
              <RadioButtons
                options={_.map(years, (id => ({ id: id, display: run_template("{{" + id + "}}"), active: id === year })))}
                onChange={id => {
                  const new_path = `/treemap/${perspective}/${color_var}/${id}`;
                  if (history.location.pathname !== new_path) {
                    // the first_column prop, and thus this button's active id, is updated through this route push
                    history.push(new_path);
                  }
                }}
              />
            </div>
          }
        />
      </div>
    )
  }
}
