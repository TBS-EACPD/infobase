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
      <div className="TreeMap__SideBar">
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

// style="" className=" fcol-md-2 sm-hide">


const chevron_html = `<img class="TreeMap__SideBar__Chevron" src=${get_static_url("svg/chevron.svg")}/>`;
const sidebar_item_html = function (d) {
  return (`
  ${ d.parent ? chevron_html : ""}
  <div> ${d.data.name} </div>
  <div> ${formats.compact1(d.data.amount)} </div>
`)
}

/* const side_bar_text_items = side_menu
  .selectAll(".TreeMap_SideBar__Text")
  .data( _.uniq(d.ancestors().reverse().concat([d])) )

side_bar_text_items.exit().remove();
side_bar_text_items.enter()
  .append("div")
  .attr("class","TreeMap_SideBar__Text")
  .merge(side_bar_text_items)
  .html(sidebar_item_html)
  .style("cursor", sidebar_data_el => d === sidebar_data_el ? "normal" : "pointer" )
  .classed("TreeMap__ZoomControl--has-zoom-out", !!d.parent)
  .on('click', function(sidebar_data_el){
    if(d === sidebar_data_el){
      return;
    }
    transition.call(this, ...arguments)
  }); */