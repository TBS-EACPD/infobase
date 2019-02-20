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


const text_maker = create_text_maker([treemap_text]);

export class TreeMapTopbar extends React.Component {
  constructor() {
    super();
  }
  handleClick(ix) {
    this.props.setRouteCallback(this.props.org_route.slice(0, ix + 1), true)
  }
  render() {
    const {
      setRouteCallback,
      org_route,
      history,
    } = this.props;
    return (
      <div className="TreeMap__ZoomControl">
        <ol className="breadcrumb" style={{
          background: "none",
          padding: "10px", 
          margin: "0px"}}
        >
          {_.isEmpty(org_route) ?
            <li className="TreeMap__ZoomControl--no-zoom-out">
              <span dangerouslySetInnerHTML={{ __html: text_maker("government_stats") }} />
            </li> :
            <li className="TreeMap__ZoomControl--has-zoom-out">
              <span dangerouslySetInnerHTML={{ __html: text_maker("government_stats") }}
                onClick={() => { this.handleClick(-1) }}
              />
            </li>
          }
          {_.map(org_route.slice(0, -1), (display, ix) =>
            <Fragment key={ix} >
              <li aria-hidden="true">
                <img
                  src={get_static_url("svg/arrow.svg")}
                  style={{
                    width: "20px",
                    height: "20px",
                    margin: "-12px 2px 0px 3px",
                  }}
                />
              </li>
              <li className="TreeMap__ZoomControl--has-zoom-out">
                {
                  <span dangerouslySetInnerHTML={{ __html: display }}
                    onClick={() => { this.handleClick(ix) }}
                  />
                }
              </li>
            </Fragment>
          )}
          {!_.isEmpty(org_route) ?
            <Fragment>
              <li aria-hidden="true">
                <img
                  src={get_static_url("svg/arrow.svg")}
                  style={{
                    width: "20px",
                    height: "20px",
                    margin: "-12px 2px 0px 3px",
                  }}
                />
              </li>
              <li className="TreeMap__ZoomControl--no-zoom-out">
                {
                  <span dangerouslySetInnerHTML={{ __html: org_route[org_route.length - 1] }} />
                }
              </li>
            </Fragment>
            : <div />
          }
        </ol>
      </div>
    )
  }
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