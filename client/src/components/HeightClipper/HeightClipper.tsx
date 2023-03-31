import _ from "lodash";
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

export const HeightClipper = (props: HeightClipperProps) =>
  is_a11y_mode ? props.children : <_HeightClipper {...props} />;

class _HeightClipper extends React.Component<
  HeightClipperProps,
  HeightClipperState
> {
  main = React.createRef<HTMLDivElement>();
  content = React.createRef<HTMLDivElement>();
  untabbable_children = React.createRef<HTMLDivElement>();
  debounced_mutation_callback: MutationCallback;
  observer: MutationObserver;

  constructor(props: HeightClipperProps) {
    super(props);
    this.state = {
      exceedsHeight: false,
      shouldClip: true,
    };

    this.debounced_mutation_callback = _.debounce(() => {
      const untabbable_children_node = this.untabbable_children.current;

      if (untabbable_children_node) {
        this.setFocusableFalse(untabbable_children_node);
      }
    });

    this.observer = new MutationObserver(this.debounced_mutation_callback);
  }

  componentWillUnmount() {
    this.observer.disconnect();
  }

  componentDidMount() {
    this.measureHeightAndUpdateState();

    const untabbable_children_node = this.untabbable_children
      .current as HTMLElement;

    this.observer.observe(untabbable_children_node, {
      childList: true,
      attributes: false,
      subtree: true,
    });
  }

  componentDidUpdate() {
    this.measureHeightAndUpdateState();

    const height_clipper_node = this.main.current as HTMLElement;
    const untabbable_children_node = this.untabbable_children.current;

    // if the height clipper is collapsed it will have a div classed .untabbable_children,
    // do not want any of that node's children to be tab-selectable
    // if no .untabbable_children div, then need to reset the tabindex/focusable attributes of the height clipper children
    if (this.state.exceedsHeight && this.state.shouldClip) {
      if (untabbable_children_node) {
        this.setFocusableFalse(untabbable_children_node);
      }
    } else {
      _.map<Element, HTMLElement>(
        height_clipper_node.querySelectorAll('[tabindex="-999"]'),
        _.identity
      ).flatMap((node: HTMLElement) => node.removeAttribute("tabindex"));

      _.map<Element, HTMLElement>(
        height_clipper_node.querySelectorAll("[prev-tabindex]"),
        _.identity
      ).flatMap((node: HTMLElement) => {
        const temp = node.getAttribute("prev-tabidnex");
        if (temp !== null) {
          const previous_tabindex = temp;
          node.setAttribute("tabindex", previous_tabindex);
          node.removeAttribute("prev-tabindex");
        }
      });

      _.map<Element, HTMLElement>(
        height_clipper_node.querySelectorAll("svg"),
        _.identity
      ).flatMap((node: HTMLElement) => node.removeAttribute("focusable"));
    }
  }

  setFocusableFalse(untabbable_children_node: Element) {
    _.map<Element, HTMLElement>(
      untabbable_children_node.querySelectorAll("*"),
      _.identity
    ).flatMap((node: HTMLElement) => {
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
    ).flatMap((node: HTMLElement) => {
      node.setAttribute("focusable", "false");
    });
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

    return (
      <div
        ref={this.main}
        style={{
          position: "relative",
          maxHeight: isClipped ? pixelClipHeight : undefined,
          overflow: isClipped ? "hidden" : undefined,
        }}
      >
        {isClipped && (
          /* eslint-disable jsx-a11y/click-events-have-key-events */
          /* eslint-disable jsx-a11y/no-static-element-interactions */
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
                  this.content.current?.focus();
                });
              }}
            >
              <TM k={buttonTextKey || "show_text_content"} />
            </button>
          </div>
        )}
        <div aria-hidden={isClipped} tabIndex={-1} ref={this.content}>
          <div
            className={isClipped ? "untabbable_children" : ""}
            ref={this.untabbable_children}
          >
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
