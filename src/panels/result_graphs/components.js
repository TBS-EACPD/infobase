const { Fragment } = require('react');
const classNames = require('classnames');
const {
  text_maker,
  util_components: {
    TextMaker,
    TM,
    Format,
  },
} = require('../shared.js');
const { result_statuses, result_simple_statuses } = require('../../models/businessConstants.js');

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
  <ul className="list-unstyled indicator-list">
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
        </Fragment>}

      { !_.isEmpty(indicator.explanation) && 
        <Fragment>
          <dt>
            <TM k="notes" />
          </dt>
          <dd>
            {indicator.explanation}  
          </dd>
        </Fragment>}
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

const Glyph = ({color,type}) => <span style={{color}} className={`glyphicon glyphicon-${type} v-centered`} />
const status_icons = {
  //icons for specific colours that group the other status_keys
  success: <Glyph type="ok-circle" color="#006400"/>,
  ontrack: <Glyph type="time" color="#006400" />,
  failure: <Glyph type="exclamation-sign" color="#880707" />,
  not_avail: <Glyph type="question-sign" color="#6b6b6b"/>,
  not_appl: <Glyph type="minus-sign" color="#12307d" />,
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
    {_.chain(ordered_icon_keys)
      .map( icon_key => ({icon_key, count: icon_counts[icon_key] || 0 }) )
      .map( ({icon_key, count }) =>
        <button
          onClick={()=>onIconClick(icon_key)}
          className={classNames("status-icon-table__item", _.includes(active_list, icon_key) && "status-icon-table__item--active" )}
          key={icon_key}
        >
          <div 
            className="status-icon-table__eye"
            style={{
              visibility: active_list.length !==0 ? "visible" : "hidden",
            }}
          >
            <span
              className={
                "glyphicon glyphicon-eye-" + 
                  (_.includes(active_list, icon_key) ? 
                    "open" : 
                    "close")
              }
            ></span>
          </div>
          <div className="status-icon-table__icon-count">
            <span className="status-icon-table__count">
              {count}
            </span>
            <span className="status-icon-table__icon">
              {status_icons[icon_key]}
            </span>
          </div>
          <div className="status-icon-table__word">
            <span
              className="link-unstyled"
              tabIndex={0}
              aria-hidden="true"
              data-glossary-key={icon_key_to_glossary_key[icon_key]}
              data-toggle="tooltip"
              data-html="true"
              data-container="body"
              onClick={()=>onIconClick(icon_key)}
              onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && onIconClick(icon_key)}
            >
              {result_simple_statuses[icon_key].text}
            </span>
          </div>

        </button>
      ).value()}
  </div>
  <table className="sr-only">
    <thead>
      <tr>
        {_.map(icon_counts, (count, icon_key) => 
          <th key={icon_key}>
            <a 
              href={`#glossary/${icon_key_to_glossary_key[icon_key]}`}
              className="sr-only"
              title={text_maker('glossary_link_title')}
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
      template_str={
        `{{gl_tt "${result_statuses[status_key].text}" "${icon_key_to_glossary_key[icon_key]}"}}`
      }
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


module.exports = exports = {
  IndicatorDisplay: IndicatorList,
  QuadrantDefList,
  status_icons,
  indicators_period_span_str,
  StatusIconTable,
  InlineStatusIconList,
} 
