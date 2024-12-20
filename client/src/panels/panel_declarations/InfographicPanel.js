import classNames from "classnames";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { Fragment } from "react";

import { panel_context } from "src/panels/PanelRenderer";

import {
  Panel,
  create_text_maker_component,
  ShareButton,
  WriteToClipboard,
  PDFGenerator,
  Details,
  FootnoteList,
  GlossaryItem,
} from "src/components/index";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { get_source_links } from "src/DatasetsRoute/utils";

import { IconCopyLink } from "src/icons/icons";

import { infographic_href_template } from "src/infographic/infographic_href_template";

import text from "./InfographicPanel.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const InlineCommaList = ({ items }) => (
  <ul className="list-unstyled list-inline" style={{ display: "inline" }}>
    {_.map(items, (item, ix) => (
      <li key={ix} className="list-inline-item">
        {item}
        {ix !== items.length - 1 && ", "}
      </li>
    ))}
  </ul>
);

export const InfographicPanel = (props) => {
  const { Consumer } = panel_context;
  return <Consumer>{(ctx) => <Panel_ context={ctx} {...props} />}</Consumer>;
};
class Panel_ extends React.Component {
  render() {
    const {
      title,
      sources,
      datasets,
      glossary_keys,
      footnotes,
      context,
      children,
      allowOverflow,
    } = this.props;

    const subject = context && context.subject;

    const file_name = `${subject.id}_${title}.pdf`;

    const panel_link =
      context &&
      infographic_href_template(subject, context.active_bubble_id, {
        panel_key: context.panel_key,
      }) &&
      window.location.href.replace(
        window.location.hash,
        infographic_href_template(subject, context.active_bubble_id, {
          panel_key: context.panel_key,
        })
      );

    const share_modal_subject_fragment = subject
      ? (subject.subject_type === "tag" ||
        subject.subject_type === "gov" ||
        subject.subject_type === "service"
          ? subject.name
          : subject.subject_type === "dept"
          ? subject.abbr
          : `${subject.dept.abbr} - ${subject.name}`) + " — "
      : "";
    const share_modal_title = `${share_modal_subject_fragment}${title}`;

    const header_utils = context && (
      <div style={{ marginLeft: "auto" }}>
        {context.panel_key && !is_a11y_mode && (
          <PDFGenerator
            target_id={context.panel_key}
            file_name={file_name}
            title={title}
            link={panel_link}
            button_class_name={"panel-heading-utils"}
          />
        )}
        {panel_link && (
          <ShareButton
            url={panel_link}
            title={share_modal_title}
            button_class_name={"panel-heading-utils"}
            button_description={text_maker("panel_share_button")}
          />
        )}
        {!context.no_permalink && panel_link && (
          <WriteToClipboard
            text_to_copy={panel_link}
            button_class_name={"panel-heading-utils"}
            button_description={text_maker("copy_panel_link")}
            IconComponent={IconCopyLink}
          />
        )}
      </div>
    );
    return (
      <Panel
        allowOverflow={allowOverflow}
        title={title}
        otherHeaderContent={header_utils}
      >
        {children}
        {!_.isEmpty(glossary_keys) && (
          <div className="mrgn-tp-md">
            <TM k="panel_additional_terms" />
            <TM k="panel_inline_colon" />
            <InlineCommaList
              items={_.map(glossary_keys, (key) => (
                <GlossaryItem id={key} item_class="bold" />
              ))}
            />
          </div>
        )}
        {!_.isEmpty(sources) && (
          <div className="mrgn-tp-md">
            <TM k="sources" />
            <TM k="panel_inline_colon" />
            <InlineCommaList
              items={_.chain(sources)
                .map("key")
                .thru(get_source_links)
                .map(({ href, html }, ix) => (
                  <a key={ix} className="bold" href={href}>
                    <span dangerouslySetInnerHTML={{ __html: html }} />
                  </a>
                ))
                .value()}
            />
          </div>
        )}
        {!_.isEmpty(datasets) && (
          <div className="mrgn-tp-md">
            <TM k="datasets" />
            <TM k="panel_inline_colon" />
            <InlineCommaList
              items={_.map(datasets, ({ name, infobase_link }) => (
                <a className="bold" href={infobase_link}>
                  <span dangerouslySetInnerHTML={{ __html: name }} />
                </a>
              ))}
            />
          </div>
        )}
        {!_.isEmpty(footnotes) && (
          <div className="mrgn-tp-md">
            <Details
              summary_content={<TM k="footnotes" />}
              content={<FootnoteList footnotes={footnotes} />}
            />
          </div>
        )}
      </Panel>
    );
  }
}

/*
  shorthand for 
    <InfographicPanel>
      <div className="medium-panel-text">
        {children}
      </div>
    </InfographicPanel>
*/
export const TextPanel = (props) => {
  const { children } = props;
  const filtered_props = _.omit(props, "children");
  const new_children = <div className="medium-panel-text">{children}</div>;
  return (
    <InfographicPanel {...filtered_props}>{new_children}</InfographicPanel>
  );
};

/* 
  The below components allow to reduce some redundancy when addressing a particular use case: 
  
  A simple column split with vertically-centered content in each column.   

  Simply use 

  <StdPanel title footnotes sources>
    <Col size={12}>
      All children must be of type 'Col'. If you need non column based content, you must wrap it in a 12-sized Col
    </Col>
    <Col size={5}>
      {...first_col_content}
    </Col>
    <Col size={7}>
      {...first_col_content}
    </Col>
  </StdPanel>
*/

//Dummy component that will be remapped to flexboxgrid columns
// TS TODO, Col should take props { children, size }
const Col = () => null;
Col.propTypes = {
  size: PropTypes.number.isRequired,
  isText: PropTypes.bool,
  isGraph: PropTypes.bool,
};

const flatten_and_filter_children = (children) =>
  _.chain(children)
    .thru((children) => (_.isArray(children) ? children : [children]))
    .flatMap((child) => {
      if (child.type && child.type === Fragment) {
        return child.props.children;
      } else {
        return child;
      }
    })
    .filter((child) => child && child.type)
    .value();

const StdPanel = ({ children, containerAlign, ...panelProps }) => {
  const mapped_children = _.chain(children)
    .thru(flatten_and_filter_children)
    .map(({ props }, ix) => {
      const { size, isText, isGraph, extraClasses, passedRef } = props;

      return (
        <div
          className={classNames(
            `col-12 col-lg-${size}`,
            isText && "medium-panel-text",
            !_.isUndefined(extraClasses) && extraClasses
          )}
          style={isGraph ? { position: "relative" } : null}
          key={ix}
          ref={passedRef}
        >
          {props.children}
        </div>
      );
    })
    .value();

  return (
    <InfographicPanel {...panelProps}>
      <div className={`row align-items-${containerAlign || "center"}`}>
        {mapped_children}
      </div>
    </InfographicPanel>
  );
};
StdPanel.propTypes = {
  children: function (props) {
    const { children } = props;

    const are_children_valid = (children) => {
      const filtered_and_flattened_children =
        flatten_and_filter_children(children);

      return _.every(filtered_and_flattened_children, { type: Col });
    };

    if (!are_children_valid(children)) {
      return new Error(
        `StdPanel expects all children to be either of the type 'Col', a fragment containing children of type 'Col', or false (in the case of a conditional child component)`
      );
    }
  },
};

export { Col, StdPanel };
