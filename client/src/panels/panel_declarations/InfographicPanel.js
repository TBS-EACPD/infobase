import classNames from "classnames";
import PropTypes from "prop-types";
import { Fragment } from "react";

import { is_a11y_mode } from "src/app_bootstrap/globals.js";

import {
  Panel,
  create_text_maker_component,
  ShareButton,
  WriteToClipboard,
  PDFGenerator,
  LogInteractionEvents,
} from "../../components/index.js";

import { IconCopyLink } from "../../icons/icons.js";
import { infograph_options_href_template } from "../../infographic/infographic_link.js";

import { panel_context } from "../PanelRenderer.js";

import text from "./InfographicPanel.yaml";

const { text_maker } = create_text_maker_component(text);

export const InfographicPanel = (props) => {
  const { Consumer } = panel_context;
  return <Consumer>{(ctx) => <Panel_ context={ctx} {...props} />}</Consumer>;
};
class Panel_ extends React.Component {
  render() {
    const {
      context,
      title,
      sources,
      glossary_keys,
      footnotes,
      children,
      allowOverflow,
    } = this.props;

    const subject = context && context.subject;

    const file_name_context = subject
      ? subject.level === "dept"
        ? subject.dept_code
        : subject.id
      : "";
    const file_name = `${file_name_context}_${title}.pdf`;
    const panel_link =
      context &&
      infograph_options_href_template(subject, context.active_bubble_id, {
        panel_key: context.panel_key,
      }) &&
      window.location.href.replace(
        window.location.hash,
        infograph_options_href_template(subject, context.active_bubble_id, {
          panel_key: context.panel_key,
        })
      );

    const share_modal_subject_fragment = subject
      ? (subject.level === "tag" || subject.level === "gov"
          ? subject.name
          : subject.level === "dept"
          ? subject.abbr
          : `${subject.dept.abbr} - ${subject.name}`) + " — "
      : "";
    const share_modal_title = `${share_modal_subject_fragment}${title}`;

    const header_utils = context && (
      <div style={{ marginLeft: "auto" }}>
        {context.panel_key && !is_a11y_mode && (
          <LogInteractionEvents
            event_type={"PANEL_PDF_DOWNLOADED"}
            event_details={title}
            style={{ display: "inline" }}
          >
            <PDFGenerator
              target_id={context.panel_key}
              file_name={file_name}
              title={title}
              link={panel_link}
              button_class_name={"panel-heading-utils"}
            />
          </LogInteractionEvents>
        )}
        {panel_link && (
          <LogInteractionEvents
            event_type={"PANEL_LINK_SHARED"}
            event_details={title}
            style={{ display: "inline" }}
          >
            <ShareButton
              url={panel_link}
              title={share_modal_title}
              button_class_name={"panel-heading-utils"}
              button_description={text_maker("panel_share_button")}
            />
          </LogInteractionEvents>
        )}
        {!context.no_permalink && panel_link && (
          <LogInteractionEvents
            event_type={"PANEL_LINK_COPIED"}
            event_details={title}
            style={{ display: "inline" }}
          >
            <WriteToClipboard
              text_to_copy={panel_link}
              button_class_name={"panel-heading-utils"}
              button_description={text_maker("copy_panel_link")}
              IconComponent={IconCopyLink}
            />
          </LogInteractionEvents>
        )}
      </div>
    );
    return (
      <Panel
        allowOverflow={allowOverflow}
        title={title}
        otherHeaderContent={header_utils}
        children={children}
        sources={sources}
        glossary_keys={glossary_keys}
        footnotes={footnotes}
      />
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
const Col = ({ children, size }) => null;
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
            `fcol-xs-12 fcol-md-${size}`,
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
      <div className={`frow ${containerAlign || "middle"}-xs`}>
        {mapped_children}
      </div>
    </InfographicPanel>
  );
};
StdPanel.propTypes = {
  children: function (props) {
    const { children } = props;

    const are_children_valid = (children) => {
      const filtered_and_flattened_children = flatten_and_filter_children(
        children
      );

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
