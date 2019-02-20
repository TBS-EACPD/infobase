import {
  LabeledBox,
  RadioButtons,
  Details,
} from '../util_components.js';
import './TreeMap.scss';
import {
  run_template,
} from '../models/text.js';
import treemap_text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';
import { Fragment } from 'react';
import { get_static_url } from '../request_utils.js';
import { formats } from '../core/format.js';
import { TreeMapControls } from './TreeMapControls.js';


const text_maker = create_text_maker([treemap_text]);

export class TreeMapSidebar extends React.Component {
  constructor() {
    super();
  }
  render() {
    const {
      perspective,
      color_var,
      year,
      filter_var,
      side_bar_title,
      location,
      history,
    } = this.props;
    return (
      <div>
        {/* <div className="TreeMap_SideBar__Title">
          {side_bar_title}
          <hr className="BlueHLine" />
        </div> */}
        <div className="TreeMap_SideBar__Text">
          <TreeMapControls
            perspective={ perspective }
            color_var={ color_var }
            year={ year }
            filter_var={ filter_var }
            location={ location }
            history={history}
          />
        </div>
      </div>
    )
  }
}