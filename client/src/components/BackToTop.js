import classNames from "classnames";

import { useInView } from "react-intersection-observer";
import "intersection-observer";

import { trivial_text_maker } from "../models/text.js";
import "./BackToTop.scss";

export class BackToTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shown: false,
      caught_by_footer: false,
    };

    this.page_header = document.getElementById("ib-site-header-area");
    this.page_footer = document.getElementById("wb-info");
  }

  // handleScroll = () => {
  //   const should_be_shown =
  //     window.pageYOffset >
  //     this.page_header.offsetTop + this.page_header.offsetHeight;

  //   const should_be_caught =
  //     window.innerWidth > 600 &&
  //     window.pageYOffset + window.innerHeight > this.page_footer.offsetTop + 15;

  //   this.setState({
  //     shown: should_be_shown,
  //     caught_by_footer: should_be_caught,
  //   });
  // };

  // componentDidMount() {
  //   window.addEventListener("scroll", this.handleScroll);

  //   // Resizing can reposition the page's scroll position without firing a scroll event, so watch for resizes too
  //   window.addEventListener("resize", this.handleScroll);
  // }
  // componentWillUnmount() {
  //   window.removeEventListener("scroll", this.handleScroll);
  //   window.removeEventListener("resize", this.handleScroll);
  // }

  handleClick() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  render() {
    const { shown, caught_by_footer } = this.state;
    const { ref, inView, entry } = useInView({
      root: this.page_header,
    });

    return (
      <button
        className={classNames(
          "btn",
          "btn-ib-primary",
          "back-to-top",
          !inView && "back-to-top--shown",
          !caught_by_footer && "back-to-top--fixed",
          caught_by_footer && "back-to-top--caught"
        )}
        style={{
          top: caught_by_footer
            ? `${this.page_footer.offsetTop - 50}px`
            : "auto",
        }}
        tabIndex="-1"
        onClick={() => this.handleClick()}
      >
        {console.log("inside rerender")}
        {trivial_text_maker("back_to_top")}
      </button>
    );
  }
}
