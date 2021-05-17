import _ from "lodash";
import ReactDOM from "react-dom";
import React from "react";

import { TM } from "src/components/TextMaker";

import { is_a11y_mode } from "src/core/injected_build_constants";

/*props: 
  maxChildrenHeight as an INT of pixels,
  children : JSX (content to be clipped), 
  clipHeight: css height string,
*/
interface HeightClipperProps {
  clipHeight: number;
  children: React.ReactElement;
  allowReclip: boolean;
  buttonTextKey: string;
  gradientClasses: string;
}
interface HeightClipperState {
  exceedsHeight: boolean;
  shouldClip: boolean;
}
export class HeightClipper extends React.Component<
  HeightClipperProps,
  HeightClipperState
> {
  main: React.RefObject<HTMLDivElement>;
  content: React.RefObject<HTMLDivElement>;

  constructor(props: HeightClipperProps) {
    super(props);
    this.state = {
      exceedsHeight: false,
      shouldClip: true,
    };
    this.main = React.createRef();
    this.content = React.createRef();
  }
  componentDidMount() {
    this.measureHeightAndUpdateState();
  }
  componentDidUpdate() {
    this.measureHeightAndUpdateState();

    const height_clipper_node = ReactDOM.findDOMNode(this) as HTMLElement;
    const untabbable_children_node = height_clipper_node.querySelector(
      ".untabbable_children"
    );

    // if the height clipper is collapsed it will have a div classed .untabbable_children,
    // do not want any of that node's children to be tab-selectable
    // if no .untabbable_children div, then need to reset the tabindex/focusable attributes of the height clipper children
    if (untabbable_children_node) {
      _.map<Element, HTMLElement>(
        untabbable_children_node.querySelectorAll("*"),
        _.identity
      ).forEach((node: HTMLElement) => {
        if (
          !_.isUndefined(node.tabIndex) &&
          !_.isNull(node.tabIndex) &&
          node.tabIndex >= 0
        ) {
          const tabindex_attr = node.getAttribute("tabindex");
          if (tabindex_attr) {
            node.setAttribute("prev-tabindex", tabindex_attr);
          }

          node.setAttribute("tabindex", "-999");
        }
      });

      _.map<Element, HTMLElement>(
        untabbable_children_node.querySelectorAll("svg"),
        _.identity
      ).forEach((node: HTMLElement) => node.setAttribute("focusable", "false"));
    } else {
      _.map<Element, HTMLElement>(
        height_clipper_node.querySelectorAll('[tabindex="-999"]'),
        _.identity
      ).forEach((node: HTMLElement) => node.removeAttribute("tabindex"));

      _.map<Element, HTMLElement>(
        height_clipper_node.querySelectorAll("[prev-tabindex]"),
        _.identity
      ).forEach((node: HTMLElement) => {
        const previous_tabindex = node.getAttribute("prev-tabindex")!;
        node.setAttribute("tabindex", previous_tabindex);
        node.removeAttribute("prev-tabindex");
      });

      _.map<Element, HTMLElement>(
        height_clipper_node.querySelectorAll("svg"),
        _.identity
      ).forEach((node: HTMLElement) => node.removeAttribute("focusable"));
    }
  }
  measureHeightAndUpdateState() {
    if (
      this.main &&
      this.main.current &&
      !this.state.exceedsHeight &&
      this.state.shouldClip &&
      this.main.current.offsetHeight > this.props.clipHeight
    ) {
      this.setState({ exceedsHeight: true });
    }
  }
  render() {
    const {
      clipHeight,
      children,
      allowReclip,
      buttonTextKey,
      gradientClasses,
    } = this.props;
    const pixelClipHeight = clipHeight + "px";

    const { exceedsHeight, shouldClip } = this.state;

    const isClipped = exceedsHeight && shouldClip;

    return is_a11y_mode ? (
      children
    ) : (
      <div
        ref={this.main}
        style={{
          position: "relative",
          maxHeight: isClipped ? pixelClipHeight : undefined,
          overflow: isClipped ? "hidden" : undefined,
        }}
      >
        {isClipped && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              position: "absolute",
              top: "0px",
              left: "0px",
              height: pixelClipHeight,
              cursor: "pointer",
              zIndex: 1005,
            }}
            className={gradientClasses ? gradientClasses : "gradient"}
            onClick={() => {
              this.setState({ shouldClip: false });
            }}
          >
            <button
              className="btn btn-ib-primary"
              style={{
                alignSelf: "flex-end",
                height: "40px",
                marginBottom: "10px",
              }}
              onClick={() => {
                this.setState({ shouldClip: false }, () => {
                  this.content.current!.focus();
                });
              }}
            >
              <TM k={buttonTextKey || "show_text_content"} />
            </button>
          </div>
        )}
        <div aria-hidden={isClipped} tabIndex={-1} ref={this.content}>
          <div className={isClipped ? "untabbable_children" : ""}>
            {children}
          </div>
        </div>
        {allowReclip && exceedsHeight && !shouldClip && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              className="btn btn-ib-primary"
              style={{
                alignSelf: "flex-end",
                height: "40px",
                marginBottom: "20px",
                marginTop: "5px",
              }}
              onClick={() => {
                this.setState({ shouldClip: true });
              }}
            >
              <TM k="hide_content" />
            </button>
          </div>
        )}
      </div>
    );
  }
}
