import classNames from "classnames";

import { useInView } from "react-intersection-observer";
import "intersection-observer";

import { trivial_text_maker } from "../models/text.js";
import "./BackToTop.scss";

export class BackToTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show_back_to_top: false,
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
  //     show_back_to_top: should_be_shown,
  //     caught_by_footer: should_be_caught,
  //   });
  // };

  componentDidMount() {
    const observer = new IntersectionObserver((entries, observer) => {
      if (entries[0].intersectionRatio <= 0) {
        this.setState({ show_back_to_top: true });
      } else {
        this.setState({ show_back_to_top: false });
      }
    });
    observer.observe(this.page_header);
  }
  // componentWillUnmount() {
  //   window.removeEventListener("scroll", this.handleScroll);
  //   window.removeEventListener("resize", this.handleScroll);
  // }

  handleClick() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  render() {
    const { show_back_to_top, caught_by_footer } = this.state;
    console.log(show_back_to_top);

    return (
      <button
        className={classNames(
          "btn",
          "btn-ib-primary",
          "back-to-top",
          show_back_to_top && "back-to-top--shown",
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
        {trivial_text_maker("back_to_top")}
      </button>
    );
  }
}
