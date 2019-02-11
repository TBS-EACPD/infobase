import {
  LabeledBox,
  RadioButtons,
} from '../util_components.js';
import './TreeMap.scss';
import {
  run_template,
} from '../models/text.js';
import treemap_text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';


const text_maker = create_text_maker([treemap_text]);

const all_years = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  "pa_last_year",
  "planning_year_1",
  "planning_year_2",
  "planning_year_3",
];

const years = {
  "drf": all_years,
  "tp": all_years.slice(0,5),
  "vote_stat": all_years.slice(1,6),
}

const size_controls = [
  { id: "drf", display: "DRF" },
  { id: "tp", display: "TP" },
  { id: "vote_stat", display: "Estimates (voted/stat)" },
]
const color_controls = [
  { id: "spending", display: "Spending" },
  { id: "ftes", display: "FTEs" },
]

const vs_type_controls = [
  { id: "None", display: "None" },
  { id: "1", display: text_maker("vstype1") },
  { id: "2", display: text_maker("vstype2") },
  { id: "3", display: text_maker("vstype3") },
  { id: "4", display: text_maker("vstype4") },
  { id: "5", display: text_maker("vstype5") },
  { id: "6", display: text_maker("vstype6") },
  { id: "9", display: text_maker("vstype9")},
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
      vote_stat_type,
      history,
    } = this.props;
    return (
      <div className="treemap-controls">
        <LabeledBox
          label={text_maker("treemap_display_value_label")}
          content={
            <div className="centerer">
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
              <div className="centerer">
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
        {perspective === "vote_stat" &&
          <LabeledBox
            label={"filter by VS type"}
            content={
              <div className="centerer">
                <RadioButtons
                  options={_.map(vs_type_controls, ({ id, display }) => ({ id, display, active: (!vote_stat_type && id === "None") || id === vote_stat_type }))}
                  onChange={id => {
                    const new_path = `/treemap/${perspective}/${color_var}/${year}/${id}`;
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
            <div className="centerer">
              <RadioButtons
                options={_.map(years[perspective], (id => ({ id: id, display: run_template("{{" + id + "}}"), active: id === year })))}
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
