import './TreeMap.scss';
import treemap_text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';
import { Fragment } from 'react';
import { get_static_url } from '../request_utils.js';


const text_maker = create_text_maker([treemap_text]);

const top_level_title = `${text_maker("government_stats")} (${text_maker("by_portfolio")})`;

export class TreeMapTopbar extends React.Component {
  constructor() {
    super();
  }
  handleClick(ix) {
    this.props.setRouteCallback(this.props.org_route.slice(0, ix + 1), true)
  }
  render() {
    const {
      org_route,
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
              <span dangerouslySetInnerHTML={{ __html: top_level_title }} />
            </li> :
            <li className="TreeMap__ZoomControl--has-zoom-out">
              <span dangerouslySetInnerHTML={{ __html: top_level_title }}
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
          {!_.isEmpty(org_route) &&
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
          }
        </ol>
      </div>
    )
  }
}

