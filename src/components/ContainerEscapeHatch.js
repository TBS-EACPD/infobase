// Allows child content to use full screen width, escaping from gutters such as the main.container or any other .container elements
class ContainerEscapeHatch extends React.Component {
  constructor(){
    super();

    this.container_escape_hatch = React.createRef();

    this.adjust_to_full_page_width = ( 
      () => {
        const container_escape_hatch = this.container_escape_hatch.current;

        // Hacky, but this should never be deeply nested, so resetting the escape hatche's own width to 100%
        // should be a relatively clean way of making the container width available for calculating the new 
        // negative left margin. Tried crawling backwards up the DOM to find the parent .container, but that
        // approach had issues.
        container_escape_hatch.style.width = "100%";

        const screen_width = window.outerWidth
        const container_width = container_escape_hatch.offsetWidth;
        const new_escape_hatch_negative_margin_left = -0.5 * Math.abs(screen_width - container_width);

        container_escape_hatch.style.width = screen_width + "px";
        container_escape_hatch.style.marginLeft = new_escape_hatch_negative_margin_left + "px";
      } 
    ).bind(this);
  }
  componentDidMount(){
    window.addEventListener("resize", this.adjust_to_full_page_width);
    this.adjust_to_full_page_width();
  }
  componentWillUnmount(){
    window.removeEventListener("resize", this.adjust_to_full_page_width);
  } 
  render(){
    const {
      children,
    } = this.props;

    return <div 
      className={"container-escape-hatch"} 
      ref={this.container_escape_hatch}
    >
      {children}
    </div>;
  }
}

export { ContainerEscapeHatch }