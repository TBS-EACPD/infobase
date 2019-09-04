import { Fragment } from 'react';
import { util_components, general_utils } from '../shared.js';
import { get_static_url } from '../../request_utils.js';
import { glossary_href } from '../../link_utils.js';
import {
  status_key_to_glossary_key,
  status_key_to_svg_name,
  ordered_status_keys,
  get_result_doc_keys,
  link_to_results_infograph,
  result_statuses,
  result_simple_statuses,
} from './results_common.js';

const dp_docs = get_result_doc_keys("dp");
const drr_docs = get_result_doc_keys("drr");

const { 
  Format,
  HeightClipper,
  FilterTable,
  SortIndicators,
} = util_components;
const { sanitized_marked } = general_utils;

import { TM, text_maker } from './result_text_provider.js';

const get_svg_url = (status_key) => get_static_url(`svg/${status_key_to_svg_name[status_key]}.svg`);


const IndicatorResultDisplay = ({
  doc,

  data_type,
  min, 
  max,
  narrative,
  measure,

  is_new,
}) => {

  const target_unspecified_display = <TM k="unspecified_target"/>;
  
  const measure_display = (measure) => !_.isEmpty(measure) && <span> ( {measure} )</span>;

  const display_type_by_data_type = {
    num: "result_num",
    num_range: "result_num",
    dollar: "dollar",
    dollar_range: "dollar",
    percent: "result_percentage",
    percent_range: "result_percentage",
  };

  const upper_target_display = (data_type, measure, max) => (
    <Fragment>
      <span>
        <span>{`${text_maker("result_upper_target_text")} `}</span>
        <Format type={display_type_by_data_type[data_type]} content={+max} /> 
      </span> 
      {measure_display(measure)}
    </Fragment>
  );
  const lower_target_display = (data_type, measure, min) => (
    <Fragment>
      <span>
        <span>{`${text_maker("result_lower_target_text")} `}</span>
        <Format type={display_type_by_data_type[data_type]} content={+min} /> 
      </span> 
      {measure_display(measure)}
    </Fragment>
  );
  const exact_display = (data_type, measure, exact) => (
    <Fragment>
      <span>
        <span>{`${text_maker("result_exact_text")} `}</span>
        <Format type={display_type_by_data_type[data_type]} content={+exact} /> 
      </span> 
      {measure_display(measure)}
    </Fragment>
  );
  const range_display = (data_type, measure, min, max) => (
    <Fragment>
      <span> 
        <span>{`${text_maker("result_range_text")} `}</span>
        <Format type={display_type_by_data_type[data_type]} content={+min} />
        <span>{` ${text_maker("and")} `}</span>
        <Format type={display_type_by_data_type[data_type]} content={+max} />
      </span> 
      {measure_display(measure)}
    </Fragment>
  );

  const get_display_case = (data_type, min, max, narrative, measure) => {
    switch(data_type){
      case 'num':
      case 'num_range':
      case 'dollar':
      case 'dollar_range':
      case 'percent':
      case 'percent_range': {
        if ( /range/.test(data_type) && (min && max) ){
          return range_display(data_type, measure, min, max);
        } else if (min && max && min === max){
          return exact_display(data_type, measure, min);
        } else if (min && !max){
          return lower_target_display(data_type, measure, min);
        } else if (!min && max){
          return upper_target_display(data_type, measure, max);
        } else {
          return target_unspecified_display; 
        }
      }
  
      case 'text': {
        if ( _.isEmpty(narrative) ){ return target_unspecified_display; }
        return (
          <span>
            {narrative}
          </span>
        );
      }
  
      case 'tbd': {
        return <TM k="tbd_result_text" />;
      }
  
      default: {
        //certain indicators have no targets
        return null;
      }
    }
  };

  const should_display_new_status = _.indexOf(dp_docs, doc) > 0 || _.indexOf(drr_docs, doc) > 0;
  return (
    <Fragment>
      { get_display_case(data_type, min, max, narrative, measure) }
      { should_display_new_status && is_new &&
        <Fragment>
          {" ("}
          <TM k="new_indicator" el="strong" />
          {")"}
        </Fragment>
      }
    </Fragment>
  );
};

const Drr17IndicatorResultDisplay = ({
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
            <Format type="dollar" content={+min || +max} />
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
            <span>{` ${text_maker("to")} `}</span>
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
            <Format type="result_percentage" content={+min} />
            <span>{` ${text_maker("to")} `}</span>
            <Format type="result_percentage" content={+max} />
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
            <Format type="dollar" content={+min} />  
            <span>{` ${text_maker("to")} `}</span>
            <Format type="dollar" content={+min} />
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
};

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
  const is_drr = /drr/.test(indicator.doc);
  const has_previous_year_target = !_.isNull(indicator.previous_year_target_type);
  const has_previous_year_result = false; // previous year results aren't in the API right now, but they probably will be for DRR18 (if not, clean this out)
  return (
    <div className="indicator-item">
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
          { indicator.doc === "drr17" ?
            <Drr17IndicatorResultDisplay
              data_type={indicator.target_type}
              min={indicator.target_min}
              max={indicator.target_max}
              narrative={indicator.target_narrative}
              measure={indicator.measure}
            /> :
            <IndicatorResultDisplay
              doc={indicator.doc}

              data_type={indicator.target_type}
              min={indicator.target_min}
              max={indicator.target_max}
              narrative={indicator.target_narrative}
              measure={indicator.measure}

              is_new={!has_previous_year_target}
            />
          }
        </dd>

        { is_drr && indicator.actual_result &&
          <Fragment>
            <dt>
              <TM k="target_result" />
            </dt>
            <dd>
              { indicator.doc === "drr17" ?
                <Drr17IndicatorResultDisplay
                  data_type={indicator.actual_datatype}
                  min={indicator.actual_result}
                  max={indicator.actual_result}
                  narrative={indicator.actual_result}
                  measure={indicator.measure}
                /> :
                <IndicatorResultDisplay
                  doc={indicator.doc}

                  data_type={indicator.actual_datatype}
                  min={indicator.actual_result}
                  max={indicator.actual_result}
                  narrative={indicator.actual_result}
                  measure={indicator.measure}

                  is_new={has_previous_year_result}
                />
              }
            </dd>
          </Fragment>
        }

        { has_previous_year_target &&
          <Fragment>
            <dt>
              <TM k="previous_year_target"/>
            </dt>
            <dd>
              <IndicatorResultDisplay
                doc={indicator.doc}
      
                data_type={indicator.previous_year_target_type}
                min={indicator.previous_year_target_min}
                max={indicator.previous_year_target_max}
                narrative={indicator.previous_year_target_narrative}
                measure={indicator.previous_year_measure}
              />
            </dd>
          </Fragment>
        }

        { is_drr && has_previous_year_result &&
          <Fragment>
            <dt>
              <TM k="previous_year_target_result"/>
            </dt>
            <dd>
              <IndicatorResultDisplay
                doc={indicator.doc}
      
                data_type={indicator.previous_year_actual_result}
                min={indicator.previous_year_actual_result}
                max={indicator.previous_year_actual_result}
                narrative={indicator.previous_year_actual_result}
                measure={indicator.previous_year_measure}
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

        { !_.isEmpty(indicator.target_explanation) &&
          <Fragment>
            <dt>
              <TM k="target_explanation" />
            </dt>
            <dd>
              <div dangerouslySetInnerHTML={{ __html: sanitized_marked(indicator.target_explanation) }} /> 
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
                <div dangerouslySetInnerHTML={{ __html: sanitized_marked(indicator.methodology) }} /> : 
                <HeightClipper clipHeight={100}>
                  <div dangerouslySetInnerHTML={{ __html: sanitized_marked(indicator.methodology) }} /> 
                </HeightClipper>
              }
            </dd>
          </Fragment>
        }
      </dl>
    </div>
  );
};


//must have only 4 elements
const QuadrantDefList = ({defs} ) => (
  <div>
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
);


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


const StatusIconTable = ({ icon_counts, onIconClick, onClearClick, active_list }) => (
  <div>
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
                  data-toggle="tooltip"
                  data-ibtt-glossary-key={status_key_to_glossary_key[status_key]}
                  data-ibtt-html="true"
                  data-ibtt-container="body"
                >
                  {result_simple_statuses[status_key].text}
                </span>
              ) :
              (
                <a 
                  href={glossary_href(status_key_to_glossary_key[status_key])} 
                  title={text_maker("glossary_link_title")}
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
                title={text_maker('glossary_link_title')}
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
);

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
    .value();
};



const StatusDisplay = ({
  indicator: {
    status_key, 
  },  
}) => (
  <div>
    <span className="nowrap">
      <span style={{paddingRight: "5px"}}> { status_icons[status_key] } </span>
      <TM
        k="result_status_with_gl"
        args={{
          text: result_statuses[status_key].text,
          glossary_key: status_key_to_glossary_key[status_key],
        }}
      />
    </span>
  </div>
);


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
    .value();
}

const IndicatorDisplay = IndicatorList;

class HorizontalStatusTable extends React.Component {
  constructor(props){
    super();
    this.state = {
      sort_by: _.keys(props.status_columns)[0],
      descending: true,
      show_all: false,
    };
  }

  header_click(col_name){
    this.setState({
      sort_by: col_name,
      descending: (
        this.state.sort_by === col_name ?
          !this.state.descending :
          true
      ),
    });
  }

  render(){
    const {
      counts_by_dept,
      gov_counts,
      status_columns,
      doc, 
    } = this.props;
    const { sort_by, descending, show_all } = this.state;

    const status_column_keys = _.keys(status_columns);

    const sorted_filtered_counts = _.chain(counts_by_dept)
      .each( ({counts}) => {
        counts[`${doc}_total`] = counts[`${doc}_total`] || _.reduce(
          counts,
          (total, count, count_key) => total + (
            _.startsWith(count_key, doc) ?
            count :
            0
          ),
          0,
        );
      })
      .reject( ({counts}) => counts[`${doc}_total`] === 0 )
      .sortBy( ({counts}) => counts[`${doc}_total`] )
      .reverse()
      .pipe( show_all ? _.identity : list => _.take(list, 15) )
      .sortBy( 
        sort_by ==='subject' ? 
          ({subject}) => subject.name : 
          row => row.counts[sort_by]
      )
      .pipe( descending ? arr => arr.reverse() : _.identity )
      .value();

    return (
      <div style={{overflowX: "auto"}}>
        <table className="table table-dark-blue table-dark-bordered no-total-row">
          <caption className="sr-only">
            <TM k="indicator_targets" />
          </caption>
          <thead>
            <tr className="table-header">
              <th 
                className="center-text"
                onClick={ () => this.header_click("subject") }
              >
                <TM k="org" />
                <SortIndicators 
                  asc={!descending && sort_by === "subject"} 
                  desc={descending && sort_by === "subject"}
                />
              </th>
              {
                _.map(status_columns, (column_header, column_key) => {
                  return (
                    <th 
                      key={column_key} 
                      className="center-text"
                      onClick={ () => this.header_click(column_key) }
                    >
                      { column_header }
                      <SortIndicators 
                        asc={!descending && sort_by === column_key} 
                        desc={descending && sort_by === column_key}
                      />
                    </th>
                  );
                })
              }
            </tr>
          </thead>
          <tbody>
            {_.map(sorted_filtered_counts, ({ subject, counts }) => 
              <tr key={subject.id}>
                <td>
                  { subject.level === "gov" && <TM k="goc_total"/> }
                  { subject.level === "dept" &&
                    <a href={link_to_results_infograph(subject)}>
                      {subject.name}
                    </a>
                  }
                </td> 
  
                {_.map(
                  status_column_keys, 
                  status => (
                    <td key={status} className="right_number">
                      {counts[status]}
                    </td>
                  )
                )}
              </tr>
            )}
            <tr>
              <td>
                <TM k="goc_total"/>
              </td>
              {_.map(
                status_column_keys, 
                status => (
                  <td key={status} className="right_number">
                    {gov_counts[status]}
                  </td>
                )
              )}
            </tr>
          </tbody>
        </table>
        { !show_all && 
          <div style={{textAlign: 'right'}}>
            <button 
              className="btn btn-ib-primary"
              onClick={() => { this.setState({ show_all: true }); }}
            >
              <TM k="show_all_orgs" />
            </button>
          </div>
        }
      </div>
    );
  }
}

export {
  IndicatorDisplay,
  QuadrantDefList,
  status_icons,
  indicators_period_span_str,
  StatusIconTable,
  InlineStatusIconList,
  HorizontalStatusTable,
}; 
