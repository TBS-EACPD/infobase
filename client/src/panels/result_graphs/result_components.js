import { Fragment } from 'react';
import { util_components, general_utils } from '../shared.js';
import { glossary_href } from '../../link_utils.js';
import {
  status_key_to_glossary_key,
  ordered_status_keys,
  link_to_results_infograph,
  result_statuses,
  result_simple_statuses,
  indicator_text_functions,
  result_docs,
} from './results_common.js';
import {
  IconCheck,
  IconAttention,
  IconNotApplicable,
  IconClock,
} from '../../icons/icons.js';
import * as color_defs from '../../core/color_defs.js';

const {
  indicator_target_text,
  indicator_actual_text,
  indicator_previous_target_text,
  indicator_previous_actual_text,
  drr17_indicator_target_text,
} = indicator_text_functions;

const { 
  HeightClipper,
  FilterTable,
  SortDirections,
} = util_components;
const { sanitized_marked } = general_utils;

import { TM, text_maker } from './result_text_provider.js';

const IndicatorResultDisplay = (props) => {
  const {indicator, is_actual, is_drr17, is_previous} = props;
  if(is_actual){
    return is_previous ? <span>{indicator_previous_actual_text(indicator)}</span> : <span>{indicator_actual_text(indicator)}</span> ;
  }
  if(!is_drr17){
    return is_previous ? <span>{indicator_previous_target_text(indicator)}</span> : <span>{indicator_target_text(indicator)}</span> ;
  }
  return <span>{drr17_indicator_target_text(indicator)}</span> ;
};


const Drr17IndicatorResultDisplay = ({
  data_type,
  min, 
  max,
  narrative,
  measure,
}) => {
  return (
    <span>
      {drr17_indicator_target_text({
        data_type,
        min, 
        max,
        narrative,
        measure,
      })}
    </span>
  );
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
  const could_have_previous_year_target = result_docs[indicator.doc].could_have_previous;
  const has_previous_year_target = !_.isNull(indicator.previous_year_target_type);
  const has_previous_year_result = false; // DRR_TODO: previous year results aren't in the API right now, but they probably will be for DRR18 (if not, clean this out)
  const should_display_new_status = _.indexOf(dp_docs, indicator.doc) > 0 || _.indexOf(drr_docs, indicator.doc) > 0;
  return (
    <div className="indicator-item">
      <dl className="dl-horizontal indicator-item__dl">
        
        { indicator.is_reporting_discontinued &&
          <Fragment>
            <dt>
              <TM k="note" />
            </dt>
            <dd>
              <TM k="result_is_retired" />
            </dd>
          </Fragment>
        }

        <dt>
          <TM k="indicator" />
        </dt>
        <dd>
          {indicator.name}
          {should_display_new_status && _.isNull(indicator.previous_year_target_type) && <NewBadge/>}
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
            indicator={indicator}
            is_actual={false}
            is_drr17={indicator.doc === "drr17"}
          />
          {/* { indicator.doc === "drr17" ?
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
          } */}
        </dd>
        { is_drr && indicator.actual_result &&
          <Fragment>
            <dt>
              {indicator.status_key === "future" ? <TM k="target_result_interim"/> : <TM k="target_result"/>}
            </dt>
            <dd>
              <IndicatorResultDisplay indicator={indicator} is_actual={true} is_drr17={indicator.doc === "drr17"}/>
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
              <TM k={indicator.doc === "drr17" ? "generic_explanation" : "target_explanation"} />
            </dt>
            <dd>
              <div dangerouslySetInnerHTML={{ __html: sanitized_marked(indicator.target_explanation) }} /> 
            </dd>
          </Fragment>
        }

        { is_drr && !_.isEmpty(indicator.result_explanation) &&
          <Fragment>
            <dt>
              <TM k={"result_explanation"} />
            </dt>
            <dd>
              <div dangerouslySetInnerHTML={{ __html: sanitized_marked(indicator.result_explanation) }} /> 
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

        { could_have_previous_year_target &&
          <Fragment>
            <dt>
              <TM k="previous_year_target"/>
            </dt>
            <dd>
              {has_previous_year_target ?
                <IndicatorResultDisplay indicator={indicator} is_actual={false} is_drr17={indicator.doc === "drr17"} is_previous={true} /> :
                <TM k="new_indicator" el="strong" />
              }
            </dd>
          </Fragment>
        }

        { has_previous_year_result &&
          <Fragment>
            <dt>
              <TM k="previous_year_target_result"/>
            </dt>
            <dd>
              <IndicatorResultDisplay indicator={indicator} is_actual={true} is_drr17={indicator.doc === "drr17"} is_previous={true} />
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


const result_status_icon_components = (status, width) => {
  const icons = {
    met: <IconCheck
      key="met"
      title={result_simple_statuses.met.text}
      color={color_defs.successDarkColor}
      width={width}
      vertical_align={"0em"}
      alternate_color={false}
      inline={false}
    />,
    not_met: <IconAttention
      key="not_met"
      title={result_simple_statuses.not_met.text}
      color={color_defs.failDarkColor}
      width={width}
      vertical_align={"0em"}
      alternate_color={false}
      inline={false}
    />,
    not_available: <IconNotApplicable
      key="not_available"
      title={result_simple_statuses.not_available.text}
      color={color_defs.warnDarkColor}
      width={width}
      vertical_align={"0em"}
      alternate_color={false}
      inline={false}
    />,
    future: <IconClock
      key="future"
      title={result_simple_statuses.future.text}
      color={color_defs.tertiaryColor}
      width={width}
      vertical_align={"0em"}
      alternate_color={false}
      inline={false}
    />,
  };
  return icons[status];
};

const make_status_icons = (width) => {
  return _.chain(ordered_status_keys)
    .map(status_key => [
      status_key,
      result_status_icon_components(status_key, width),
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
                <SortDirections 
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
                      <SortDirections 
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

const NewBadge = () => {
  return (
    <span className="badge badge--is-new-indicator">
      {text_maker("new")}
    </span>
  );
};

export {
  IndicatorDisplay,
  QuadrantDefList,
  status_icons,
  large_status_icons,
  indicators_period_span_str,
  StatusIconTable,
  InlineStatusIconList,
  HorizontalStatusTable,
  NewBadge,
  Drr17IndicatorResultDisplay,
  IndicatorResultDisplay,
}; 
