import { Fragment } from 'react';
import { trivial_text_maker, util_components } from '../shared.js';
import { businessConstants } from '../../models/businessConstants.js';
import { GlossaryEntry } from '../../models/glossary.js';
import { get_static_url } from '../../request_utils.js';
import { glossary_href } from '../../link_utils.js';
import {
  status_key_to_glossary_key,
  status_key_to_svg_name,
  ordered_status_keys,
} from './results_common.js';

const { result_statuses, result_simple_statuses } = businessConstants;
const { 
  TextMaker,
  TM,
  Format,
  HeightClipper,
  FilterTable,
} = util_components;

const get_svg_url = (status_key) => get_static_url(`svg/${status_key_to_svg_name[status_key]}.svg`);

/* to be used with planned targets and actual result */
const IndicatorResultDisplay = ({
  data_type,
  min, 
  max,
  narrative,
  measure,
}) => {

  const target_unspecified_display = <TM k="unspecified_target"/>;
  
  const measure_display = !_.isEmpty(measure) && <span> ( {measure} )</span>;

  switch(data_type){
    case 'exact_num':
    case 'num': {
      const num = min || max;
      if( !num ){ return target_unspecified_display; }
      return (
        <Fragment>
          <span> 
            <Format type="result_num" content={+num} /> 
          </span> 
          {measure_display}
        </Fragment>
      );
    }

    case 'dollar': {
      if( !min && !max){ return target_unspecified_display; }
      return (
        <Fragment>
          <span> 
            <Format type="compact1" content={+min || +max} />
          </span> 
          {measure_display}
        </Fragment>
      );
    }

    case 'percent': {
      if( !min && !max){ return target_unspecified_display; }
      return (
        <Fragment>
          <span> 
            <Format type="result_percentage" content={min || max} />
          </span> 
          {measure_display}
        </Fragment>
      );
    }

    case 'num_range': {
      if( !min && !max){ return target_unspecified_display; }
      return (
        <Fragment>
          <span> 
            <Format type="result_num" content={+min} />
            <span>{` ${trivial_text_maker("to")} `}</span>
            <Format type="result_num" content={+max} />
          </span> 
          {measure_display}
        </Fragment>
      );
    }

    case 'percent_range': {
      if( !min && !max){ return target_unspecified_display; }
      return (
        <Fragment>
          <span> 
            <Format type="result_percentage" content={min} />
            <span>{` ${trivial_text_maker("to")} `}</span>
            <Format type="result_percentage" content={max} />
          </span> 
          {measure_display}
        </Fragment>
      );
    }

    case 'dollar_range': {
      if( !min && !max){ return target_unspecified_display; }
      return (
        <Fragment>
          <span> 
            <Format type="compact1" content={+min} />  
            <span>{` ${trivial_text_maker("to")} `}</span>
            <Format type="compact1" content={+min} />
          </span> 
          {measure_display}
        </Fragment>
      );
    }

    case 'text' : {
      if( _.isEmpty(narrative) ){ 
        return target_unspecified_display; 
      }
      return (
        <span>
          {narrative}
        </span>
      );
    }

    default: {
      //certain indicators have no targets
      return null;
    }
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
  const is_drr = indicator.doc === "drr17";
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

      <dt>
        <TM k="target" />
      </dt>
      <dd>
        <IndicatorResultDisplay
          data_type={indicator.target_type}
          min={indicator.target_min}
          max={indicator.target_max}
          narrative={indicator.target_narrative}
          measure={indicator.measure}
        />
      </dd>

      { is_drr && indicator.actual_result &&
        <Fragment>
          <dt>
            <TM k="target_result" />
          </dt>
          <dd>
            <IndicatorResultDisplay
              data_type={ indicator.actual_datatype }
              min={ indicator.actual_result }
              narrative={ indicator.actual_result }
            />
          </dd>
        </Fragment>
      }

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


const make_status_icons = (width) => {
  const status_icon_style = {width: width, height: width};
  return _.chain(ordered_status_keys)
    .map(status_key => [
      status_key,
      <img key={status_key} src={get_svg_url(status_key)} style={status_icon_style} />,
    ])
    .fromPairs()
    .value();
};

const large_status_icons = make_status_icons('41px');
const status_icons = make_status_icons('25px');


const StatusIconTable = ({ icon_counts, onIconClick, onClearClick, active_list }) => <div>
  <div 
    aria-hidden={true}
    className="status-icon-table"
  >
    <FilterTable
      items={
        _.map(ordered_status_keys, status_key => ({
          key: status_key,
          active: active_list.length === 0 || _.indexOf(active_list, status_key) !== -1,
          count: icon_counts[status_key] || 0,
          text: !window.is_a11y ? 
            (
              <span
                className="link-unstyled"
                tabIndex={0}
                aria-hidden="true"
                data-glossary-key={status_key_to_glossary_key[status_key]}
                data-toggle="tooltip"
                data-html="true"
                data-container="body"
              >
                {result_simple_statuses[status_key].text}
              </span>
            ) :
            (
              <a 
                href={ glossary_href( GlossaryEntry.lookup(status_key_to_glossary_key[status_key]) )} 
                title={trivial_text_maker("glossary_link_title")}
              >
                {result_simple_statuses[status_key].text}
              </a>
            ),
          icon: large_status_icons[status_key],
        }) )
      }
      item_component_order={["count", "icon", "text"]}
      click_callback={(status_key) => onIconClick(status_key)}
      show_eyes_override={active_list.length === ordered_status_keys.length}
    />
  </div>
  <table className="sr-only">
    <thead>
      <tr>
        {_.map(icon_counts, (count, status_key) => 
          <th key={status_key}>
            <a 
              href={`#glossary/${status_key_to_glossary_key[status_key]}`}
              className="sr-only"
              title={trivial_text_maker('glossary_link_title')}
            >
              {result_simple_statuses[status_key].text}
            </a>
          </th>
        )}
      </tr>
    </thead>
    <tbody>
      <tr>
        {_.map(icon_counts, (count, status_key) => 
          <td key={status_key}>
            {count}
          </td>
        )}
      </tr>
    </tbody>
  </table>
</div>

const InlineStatusIconList = ({indicators}) => {
  return _.chain(indicators)
    .filter(ind => _.nonEmpty(ind.status_key))
    .groupBy('status_key')
    .map( (group, status_key) => ({status_key, count: group.length}) )
    .sortBy( ({status_key}) => _.indexOf(ordered_status_keys, status_key) )
    .map( ({ status_key, count }) =>
      <span
        key={status_key} 
        className="inline-status-icon"
      >
        {status_icons[status_key]}
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
  indicator: {
    status_key, 
  },  
}) => <div>
  <span className="nowrap">
    <span style={{paddingRight: "5px"}}> { status_icons[status_key] } </span>
    <TextMaker
      text_key="result_status_with_gl"
      args={{
        text: result_statuses[status_key].text,
        glossary_key: status_key_to_glossary_key[status_key],
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
