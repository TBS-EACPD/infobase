import _ from "lodash";
import React, { Fragment } from "react";

import {
  HeightClipper,
  FilterTable,
  AlertBanner,
} from "src/components/index.js";

import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import * as general_utils from "src/general_utils.js";

import {
  IconCheck,
  IconAttention,
  IconNotApplicable,
  IconClock,
} from "src/icons/icons.js";

import { TM, text_maker } from "./result_text_provider.js";

import {
  status_key_to_glossary_key,
  ordered_status_keys,
  result_statuses,
  indicator_text_functions,
  get_result_doc_keys,
  result_docs,
  result_color_scale,
} from "./results_common.js";

import "./result_components.scss";

const {
  indicator_target_text,
  indicator_actual_text,
  indicator_previous_target_text,
  indicator_previous_actual_text,
} = indicator_text_functions;

const { sanitized_marked } = general_utils;

const IndicatorResultDisplay = (props) => {
  const { indicator, is_actual, is_previous } = props;
  if (is_actual) {
    return is_previous ? (
      <span>{indicator_previous_actual_text(indicator)}</span>
    ) : (
      <span>{indicator_actual_text(indicator)}</span>
    );
  } else {
    return is_previous ? (
      <span>{indicator_previous_target_text(indicator)}</span>
    ) : (
      <span>{indicator_target_text(indicator)}</span>
    );
  }
};

const IndicatorDisplay = ({ indicator, show_doc }) => {
  const is_drr = /drr/.test(indicator.doc);
  const has_previous_year_target = !_.isNull(
    indicator.previous_year_target_type
  );
  const has_previous_year_result = false; // DRR_TODO: previous year results aren't available/in the API yet, but they should be starting with DRR19 (if not, clean this out eventually)
  const dp_docs = get_result_doc_keys("dp");
  const drr_docs = get_result_doc_keys("drr");
  const should_display_new_status =
    _.indexOf(dp_docs, indicator.doc) > 0 ||
    _.indexOf(drr_docs, indicator.doc) > 0;
  return (
    <div className="indicator-item">
      <dl className="dl-horizontal indicator-item__dl">
        <dt>
          <TM k="indicator" />
        </dt>
        <dd>
          {indicator.name}
          {should_display_new_status &&
            _.isNull(indicator.previous_year_target_type) && <NewBadge />}
        </dd>

        {show_doc && (
          <Fragment>
            <dt>
              <TM k="report" />
            </dt>
            <dd>
              {`${result_docs[indicator.doc].year} ${
                is_drr ? text_maker("drr_report") : text_maker("dp_report")
              }`}
            </dd>
          </Fragment>
        )}

        <dt>
          <TM k="date_to_achieve" />
        </dt>
        <dd>{indicator.target_date}</dd>

        <dt>
          <TM k="target" />
        </dt>
        <dd>
          <IndicatorResultDisplay indicator={indicator} is_actual={false} />
        </dd>
        {is_drr && indicator.actual_result && (
          <Fragment>
            <dt>
              {indicator.status_key === "future" ? (
                <TM k="target_result_interim" />
              ) : (
                <TM k="actual_result" />
              )}
            </dt>
            <dd>
              <IndicatorResultDisplay indicator={indicator} is_actual={true} />
            </dd>
          </Fragment>
        )}

        {is_drr && (
          <Fragment>
            <dt>
              <TM k="status" />
            </dt>
            <dd>
              <StatusDisplay indicator={indicator} />
            </dd>
          </Fragment>
        )}

        {!_.isEmpty(indicator.target_explanation) && (
          <Fragment>
            <dt>
              <TM k={"target_explanation"} />
            </dt>
            <dd>
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitized_marked(indicator.target_explanation),
                }}
              />
            </dd>
          </Fragment>
        )}

        {is_drr && !_.isEmpty(indicator.result_explanation) && (
          <Fragment>
            <dt>
              <TM k={"result_explanation"} />
            </dt>
            <dd>
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitized_marked(indicator.result_explanation),
                }}
              />
            </dd>
          </Fragment>
        )}

        {!_.isEmpty(indicator.methodology) && (
          <Fragment>
            <dt>
              <TM k="methodology" />
            </dt>
            <dd>
              {is_a11y_mode ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitized_marked(indicator.methodology),
                  }}
                />
              ) : (
                <HeightClipper clipHeight={100}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitized_marked(indicator.methodology),
                    }}
                  />
                </HeightClipper>
              )}
            </dd>
          </Fragment>
        )}

        {has_previous_year_target && (
          <Fragment>
            <dt>
              <TM k="previous_year_target" />
            </dt>
            <dd>
              <IndicatorResultDisplay
                indicator={indicator}
                is_actual={false}
                is_previous={true}
              />
            </dd>
          </Fragment>
        )}

        {has_previous_year_result && (
          <Fragment>
            <dt>
              <TM k="previous_year_target_result" />
            </dt>
            <dd>
              <IndicatorResultDisplay
                indicator={indicator}
                is_actual={true}
                is_previous={true}
              />
            </dd>
          </Fragment>
        )}
      </dl>
    </div>
  );
};
const IndicatorList = ({ indicators }) => (
  <ul className="indicator-list">
    {_.map(indicators, (ind) => (
      <li key={ind.id}>
        <IndicatorDisplay indicator={ind} />
      </li>
    ))}
  </ul>
);

//must have only 4 elements
const QuadrantDefList = ({ defs }) => (
  <div>
    <dl className="quadrant-dl">
      {defs.map(({ key, val }, ix) => (
        <div key={key} className="number-box">
          <dt>{key}</dt>
          <dd>
            <div>{val}</div>
          </dd>
        </div>
      ))}
    </dl>
    <div className="clearfix" />
  </div>
);

const result_status_icon_components = (status, width) => {
  const icons = {
    met: (
      <IconCheck
        key="met"
        title={text_maker("met")}
        color={result_color_scale("met")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
    not_met: (
      <IconAttention
        key="not_met"
        title={text_maker("not_met")}
        color={result_color_scale("not_met")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
    not_available: (
      <IconNotApplicable
        key="not_available"
        title={text_maker("not_available")}
        color={result_color_scale("not_available")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
    future: (
      <IconClock
        key="future"
        title={text_maker("future")}
        color={result_color_scale("future")}
        width={width}
        svg_style={{ verticalAlign: "0em" }}
        alternate_color={false}
        inline={false}
      />
    ),
  };
  return icons[status];
};

const make_status_icons = (width) => {
  return _.chain(ordered_status_keys)
    .map((status_key) => [
      status_key,
      result_status_icon_components(status_key, width),
    ])
    .fromPairs()
    .value();
};

const large_status_icons = make_status_icons("41px");
const status_icons = make_status_icons("25px");

const StatusIconTable = ({
  icon_counts,
  onIconClick,
  onClearClick,
  active_list,
}) => (
  <div>
    <div className="status-icon-table">
      <FilterTable
        items={_.map(ordered_status_keys, (status_key) => ({
          key: status_key,
          active:
            active_list.length === 0 ||
            _.indexOf(active_list, status_key) !== -1,
          count: icon_counts[status_key] || 0,
          text: (
            <span
              className="link-unstyled"
              tabIndex={-1}
              aria-hidden="true"
              data-toggle="tooltip"
              data-ibtt-glossary-key={status_key_to_glossary_key[status_key]}
            >
              {text_maker(status_key)}
            </span>
          ),
          aria_text: text_maker(status_key),
          icon: large_status_icons[status_key],
        }))}
        item_component_order={["count", "icon", "text"]}
        click_callback={(status_key) => onIconClick(status_key)}
        show_eyes_override={active_list.length === ordered_status_keys.length}
      />
    </div>
    <table className="sr-only">
      <thead>
        <tr>
          {_.map(icon_counts, (count, status_key) => (
            <th key={status_key}>
              <span
                className="link-unstyled sr-only"
                aria-hidden="true"
                tabIndex={0}
                data-toggle="tooltip"
                data-ibtt-glossary-key={status_key_to_glossary_key[status_key]}
              >
                {text_maker(status_key)}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {_.map(icon_counts, (count, status_key) => (
            <td key={status_key}>{count}</td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);

const InlineStatusIconList = ({ indicators }) => {
  return _.chain(indicators)
    .filter((ind) => !_.isEmpty(ind.status_key))
    .groupBy("status_key")
    .map((group, status_key) => ({ status_key, count: group.length }))
    .sortBy(({ status_key }) => _.indexOf(ordered_status_keys, status_key))
    .map(({ status_key, count }) => (
      <span key={status_key}>
        {status_icons[status_key]}
        {count > 1 && <sub className="inline-status-icon__count">{count}</sub>}
      </span>
    ))
    .value();
};

const StatusDisplay = ({ indicator: { status_key } }) => (
  <div>
    <span className="nowrap">
      <span style={{ paddingRight: "5px" }}>{status_icons[status_key]}</span>
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

function indicators_period_span_str(indicators) {
  return _.chain(indicators)
    .map("target_year")
    .uniq()
    .reject((num) => !_.isNumber(num)) //filter out 'other', 'ongoing' and blanks
    .sortBy() //sort by year (no arg needed)
    .thru((nums) => {
      if (nums.length > 1) {
        return `${_.first(nums)} - ${_.last(nums)}`;
      } else if (nums.length === 1) {
        return _.first(nums);
      } else {
        return "";
      }
    })
    .value();
}

const NewBadge = () => (
  <span className="badge badge--is-new-indicator">{text_maker("new")}</span>
);

const LateDepartmentsBanner = ({ late_dept_count }) => (
  <AlertBanner style={{ textAlign: "center" }}>
    <TM k="result_late_depts_warning" args={{ late_dept_count }} />
  </AlertBanner>
);

export {
  IndicatorDisplay,
  IndicatorList,
  QuadrantDefList,
  status_icons,
  large_status_icons,
  indicators_period_span_str,
  StatusIconTable,
  InlineStatusIconList,
  NewBadge,
  IndicatorResultDisplay,
  LateDepartmentsBanner,
};
