// Allows child content to use full screen width, escaping from gutters such as the main.container or any other .container elements
class ContainerEscapeHatch extends React.Component {
  constructor(){
    super();

    this.outer_container_escape_hatch = React.createRef();
    this.inner_container_escape_hatch = React.createRef();
    
    const adjust_to_full_page_width = ( 
      () => {
        const outer_container_escape_hatch = this.outer_container_escape_hatch.current;
        const inner_container_escape_hatch = this.inner_container_escape_hatch.current;

        const screen_width = window.outerWidth
        const container_width = outer_container_escape_hatch.offsetWidth; // This assumes outer_container_escape_hatch will have the full container width
        const new_escape_hatch_negative_margin_left = -0.5 * Math.abs(screen_width - container_width);

        inner_container_escape_hatch.style.width = screen_width + "px";
        inner_container_escape_hatch.style.marginLeft = new_escape_hatch_negative_margin_left + "px";
      } 
    ).bind(this);

    this.debounced_adjust_to_full_page_width = _.debounce(adjust_to_full_page_width, 100);
  }
  componentDidMount(){
    this.debounced_adjust_to_full_page_width();
    window.addEventListener("resize", this.debounced_adjust_to_full_page_width);
  }
  componentWillUnmount(){
    window.removeEventListener("resize", this.debounced_adjust_to_full_page_width);
    this.debounced_adjust_to_full_page_width.cancel();
  } 
  render(){
    const {
      children,
    } = this.props;

    return (
      <div 
        className={"outer-container-escape-hatch"} 
        ref={this.outer_container_escape_hatch}
      >
        <div 
          className={"inner-container-escape-hatch"} 
          ref={this.inner_container_escape_hatch}
        >
          {children}
        </div>
      </div>
    );
  }
}

export { ContainerEscapeHatch }