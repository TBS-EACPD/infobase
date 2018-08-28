import { Fragment } from 'react';
import { trivial_text_maker, util_components } from '../shared.js';
import { businessConstants } from '../../models/businessConstants.js';
import { get_static_url } from '../../core/request_utils.js';

const { result_statuses, result_simple_statuses } = businessConstants;
const { 
  TextMaker,
  TM,
  Format,
  HeightClipper,
  FilterTable,
} = util_components;

const get_svg_url = (svg_name) => get_static_url(`svg/${svg_name}.svg`);

/* to be used with planned targets and actual result */
const IndicatorResultDisplay = ({
  data_type,
  min, 
  max,
  narrative,
}) => {
  switch(data_type){
    case 'num': {
      const num = min || max;
      if( !num ){ return null; }
      return <span> <Format type="result_num" content={+num} /> </span>;
    }

    case 'dollar':
      if( !min && !max){ return null; }
      return <span> <Format type="compact1" content={+min || +max} /> </span>;

    case 'percent':
      if( !min && !max){ return null; }
      return <Format type="result_percentage" content={min || max}/>

    case 'num_range':
      if( !min && !max){ return null; }
      return <span> <Format type="result_num" content={+min} /> <TextMaker text_key="to" /> <Format type="result_num" content={+max} /> </span>

    case 'percent_range':
      if( !min && !max){ return null; }
      return <span> <Format type="result_percentage" content={min}/> <TextMaker text_key="to" /> <Format type="result_percentage" content={max}/> </span>

    case 'dollar_range':
      if( !min && !max){ return null; }
      return <span> 
        <Format type="compact1" content={+min} />  <span> <TextMaker text_key="to" /> </span><Format type="compact1" content={+min} /> 
      </span>;

    case 'text' : 
      if( _.isEmpty(narrative) ){ 
        return null; 
      }
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: marked(narrative, { 
              sanitize: false, 
              gfm: true,
            }),
          }}
        />
      );

    default: //certain indicators have no targets
      return null;
  }

}


const IndicatorList = ({ indicators }) => (
  <ul className="indicator-list">
    {_.map(indicators, ind => 
      <li key={ind.id}>
        <SingleIndicatorDisplay indicator={ind} />
      </li>
    )}
  </ul>
);

const SingleIndicatorDisplay = ({indicator}) => {
  const is_drr = indicator.doc === "drr16";
  return <div className="indicator-item">
    <dl className="dl-horizontal indicator-item__dl">

      <dt>
        <TM k="indicator" />
      </dt>
      <dd>
        {indicator.name}
      </dd>

      <dt>
        <TM k="date_to_achieve" />
      </dt>
      <dd>
        {indicator.target_date}
      </dd>

      { is_drr && 
        <Fragment>
          <dt>
            <TM k="status" />
          </dt>
          <dd>
            <StatusDisplay indicator={indicator} /> 
          </dd>
        </Fragment>
      }

      <dt>
        <TM k="target" />
      </dt>
      <dd>
        <IndicatorResultDisplay
          data_type={indicator.target_type}
          min={indicator.target_min}
          max={indicator.target_max}
          narrative={indicator.target_narrative}
        />
        {
          indicator.target_type !== "text" &&  //don't show unit of measurement for narrative targets
          !_.isEmpty(indicator.measure) &&
          <span> ( {indicator.measure} )</span>
        }
      </dd>

      { is_drr && 
        <Fragment>
          <dt>
            <TM k="target_result" />
          </dt>
          <dd>
            <IndicatorResultDisplay
              data_type={indicator.actual_datatype}
              min={ indicator.actual_result }
              narrative={indicator.actual_result}
            />
          </dd>
        </Fragment>
      }

      { !_.isEmpty(indicator.explanation) && 
        <Fragment>
          <dt>
            <TM k="notes" />
          </dt>
          <dd>
            {indicator.explanation}  
          </dd>
        </Fragment>
      }


      { !_.isEmpty(indicator.methodology) && 
        <Fragment>
          <dt>
            <TM k="methodology" />
          </dt>
          <dd>
            { window.is_a11y_mode ? 
              indicator.methodology : 
              <HeightClipper clipHeight={100}>
                {indicator.methodology}  
              </HeightClipper>
            }
          </dd>
        </Fragment>
      }
    </dl>
  </div>
}


//must have only 4 elements
const QuadrantDefList = ({defs} ) => <div>
  <dl className="quadrant-dl">
    { 
      defs.map( ({key,val}, ix) => (
        <div key={key} className="number-box">
          <dt> {key} </dt>
          <dd> 
            <div>
              {val} 
            </div>
          </dd>
        </div>
      ))
    }
  </dl>
  <div className="clearfix" />
</div>


const status_icon_style = { width: '41px' };
const status_icons = {
  //icons for specific colours that group the other status_keys
  success: <img src={get_svg_url("met")} style={status_icon_style} />,
  ontrack: <img src={get_svg_url("on_track")} style={status_icon_style} />,
  failure: <img src={get_svg_url("attention_req")} style={status_icon_style} />,
  not_avail: <img src={get_svg_url("not_available")} style={status_icon_style} />,
  not_appl: <img src={get_svg_url("not_applicable")} style={status_icon_style} />,
};


const icon_key_to_glossary_key = {
  success: "RESULTS_MET",
  ontrack: "RESULTS_OT",
  failure: "RESULTS_AR",
  not_avail: "RESULTS_NA",
  not_appl: "RESULTS_NOTAPP",
};


const ordered_icon_keys = ['success', 'ontrack', 'failure', 'not_avail', 'not_appl'];
const StatusIconTable = ({ icon_counts, onIconClick, onClearClick, active_list }) => <div>
  <div 
    aria-hidden={true}
    className="status-icon-table"
  >
    <FilterTable
      items={
        _.map(ordered_icon_keys, icon_key => ({
          key: icon_key,
          active: active_list.length === 0 || _.indexOf(active_list, icon_key) !== -1,
          count: icon_counts[icon_key] || 0,
          text: (
            <span
              className="link-unstyled"
              tabIndex={0}
              aria-hidden="true"
              data-glossary-key={icon_key_to_glossary_key[icon_key]}
              data-toggle="tooltip"
              data-html="true"
              data-container="body"
              onClick={()=>onIconClick.apply(icon_key)}
              onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && onIconClick.apply(icon_key)}
            >
              {result_simple_statuses[icon_key].text}
            </span>
          ),
          icon: status_icons[icon_key],
        }) )
      }
      item_component_order={["count", "icon", "text"]}
      click_callback={onIconClick}
      show_eyes_override={active_list.length === ordered_icon_keys.length}
    />
  </div>
  <table className="sr-only">
    <thead>
      <tr>
        {_.map(icon_counts, (count, icon_key) => 
          <th key={icon_key}>
            <a 
              href={`#glossary/${icon_key_to_glossary_key[icon_key]}`}
              className="sr-only"
              title={trivial_text_maker('glossary_link_title')}
            >
              {result_simple_statuses[icon_key].text}
            </a>
          </th>
        )}
      </tr>
    </thead>
    <tbody>
      <tr>
        {_.map(icon_counts, (count, icon_key) => 
          <td key={icon_key}>
            {count}
          </td>
        )}
      </tr>
    </tbody>
  </table>
</div>

const InlineStatusIconList = ({indicators}) => {
  return _.chain(indicators)
    .filter(ind => _.nonEmpty(ind.status_color))
    .groupBy('icon_key')
    .map( (group, icon_key) => ({icon_key, count: group.length}) )
    .sortBy( ({icon_key}) => _.indexOf(ordered_icon_keys, icon_key) )
    .map( ({ icon_key, count }) =>
      <span
        key={icon_key} 
        className="inline-status-icon"
      >
        {status_icons[icon_key]}
        {
          count > 1 && 
          <sub className="inline-status-icon__count">
            {count}
          </sub>
        }
      </span>
    )
    .value()
}



const StatusDisplay = ({
  indicator:{
    status_key, 
    status_period, 
    icon_key, 
    status_color,
  },  
}) => <div>
  <span className="nowrap">
    <span style={{paddingRight: "5px"}}> { status_icons[icon_key] } </span>
    <TextMaker
      text_key="result_status_with_gl"
      args={{
        text: result_statuses[status_key].text,
        glossary_key: icon_key_to_glossary_key[icon_key],
      }}
    />
  </span>
</div>


function indicators_period_span_str(indicators){
  return _.chain(indicators)
    .map('target_year')
    .uniq()
    .reject(num => !_.isNumber(num) ) //filter out 'other', 'ongoing' and blanks
    .sortBy() //sort by year (no arg needed)
    .pipe( nums => {
      if( nums.length > 1 ){
        return `${_.first(nums)} - ${_.last(nums)}`;
      } else if(nums.length === 1){
        return _.first(nums);
      } else {
        return "";
      }
    })
    .value()
}

const IndicatorDisplay = IndicatorList;

export {
  IndicatorDisplay,
  QuadrantDefList,
  status_icons,
  indicators_period_span_str,
  StatusIconTable,
  InlineStatusIconList,
}; 
