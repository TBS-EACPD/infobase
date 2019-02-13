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
  "drf_ftes": all_years,
  "tp": all_years.slice(0, 5),
  "vote_stat": all_years.slice(1, 6),
  "so": all_years.slice(2, 5),
}

const size_controls = [
  { id: "drf", display: text_maker("DRF") },
  { id: "drf_ftes", display: text_maker("fte") },
  { id: "tp", display: text_maker("TP") },
  { id: "vote_stat", display: text_maker("EVS") },
  { id: "so", display: text_maker("SO") },
]
const color_controls = [
  { id: "spending", display: text_maker("spending") },
  { id: "ftes", display: text_maker("fte") },
]

const gc_type_controls = [
  { id: "All", display: text_maker("all") },
  { id: "g", display: text_maker("grants") },
  { id: "c", display: text_maker("contributions") },
]

const vs_type_controls = [
  { id: "All", display: text_maker("all") },
  { id: "1", display: text_maker("vstype1") },
  { id: "2", display: text_maker("vstype2") },
  { id: "3", display: text_maker("vstype3") },
  { id: "4", display: text_maker("vstype4") },
  { id: "5", display: text_maker("vstype5") },
  { id: "6", display: text_maker("vstype6") },
  //{ id: "9", display: text_maker("vstype9") }, // Other
  { id: "999", display: text_maker("treemap_vstype999") },
]

const so_type_controls_old = [
  { id: "All", display: text_maker("all") },
  { id: "1", display: text_maker("SOBJ1") },
  { id: "2", display: text_maker("SOBJ2") },
  { id: "3", display: text_maker("SOBJ3") },
  { id: "4", display: text_maker("SOBJ4") },
  { id: "5", display: text_maker("SOBJ5") },
  { id: "6", display: text_maker("SOBJ6") },
  { id: "7", display: text_maker("SOBJ7") },
  { id: "8", display: text_maker("SOBJ8") },
  { id: "9", display: text_maker("SOBJ9") },
  { id: "10", display: text_maker("SOBJ10") },
  { id: "11", display: text_maker("SOBJ11") },
  { id: "12", display: text_maker("SOBJ12") },
]

const so_type_controls = [
  { id: "All", display: text_maker("all") },
  { id: "1", display: text_maker("op_spending") },
  { id: "2", display: text_maker("capital_spending") },
  { id: "10", display: text_maker("SOBJ10") },
  { id: "11", display: text_maker("SOBJ11") },
  { id: "12", display: text_maker("SOBJ12") },
  { id: "3", display: text_maker("revenues") },
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
      filter_var,
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
                  let new_path;
                  (id === "drf" || id === "drf_ftes") ?
                    new_path = `/treemap/${id}/${color_var}/${year}` :
                    new_path = `/treemap/${id}/spending/${year}` // force to spending for other ones
                  if (history.location.pathname !== new_path) {
                    // the first_column prop, and thus this button's active id, is updated through this route push
                    history.push(new_path);
                  }
                }}
              />
            </div>
          }
        />
        {(perspective === "drf" || perspective === "drf_ftes") &&
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

        {perspective === "tp" &&
          <LabeledBox
            label={text_maker("treemap_gc_type_filter")}
            content={
              <div className="centerer">
                <RadioButtons
                  options={_.map(gc_type_controls, ({ id, display }) => ({ id, display, active: (!filter_var && id === "All") || id === filter_var }))}
                  onChange={id => {
                    const new_path = `/treemap/${perspective}/spending/${year}/${id}`;
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
            label={text_maker("treemap_vstype_filter")}
            content={
              <div className="centerer">
                <RadioButtons
                  options={_.map(vs_type_controls, ({ id, display }) => ({ id, display, active: (!filter_var && id === "All") || id === filter_var }))}
                  onChange={id => {
                    const new_path = `/treemap/${perspective}/spending/${year}/${id}`;
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
        {perspective === "so" &&
          <LabeledBox
            label={text_maker("treemap_so_filter")}
            content={
              <div className="centerer">
                <RadioButtons
                  options={_.map(so_type_controls, ({ id, display }) => ({ id, display, active: (!filter_var && id === "All") || id === filter_var }))}
                  onChange={id => {
                    const new_path = `/treemap/${perspective}/spending/${year}/${id}`;
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
                  const new_path = `/treemap/${perspective}/spending/${id}`;
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
