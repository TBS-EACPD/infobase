
const MakeBanner = ({banner_class, banner_content, location_filter}) => {
  class Banner extends React.Component {
    render(){ return null; }
    componentDidMount(){
      this.banner_element = document.createElement("div");
      this.banner_element.className = `alert alert-no-symbol alert--is-bordered large_panel_text ${banner_class || 'alert-info'}`;
      this.banner_element.innerHTML = banner_content;
      this.banner_element.style.display = "none";
      
      document.querySelector("#wb-bc > .container").appendChild(this.banner_element);

      this.toggle_banner_for_route = () => {
        const should_show_banner = !_.isFunction(location_filter) || location_filter(window.location.hash);
        if (should_show_banner){
          this.banner_element.style.display = "";
        } else {
          this.banner_element.style.display = "none";
        }
      };

      window.addEventListener(
        "hashchange", 
        this.toggle_banner_for_route
      );
      
      this.toggle_banner_for_route();
    }
    componentWillUnmount(){
      window.removeEventListener(
        "hashchange",
        this.toggle_banner_for_route
      );
    }
  }
  return Banner;
}

const TestBanner = MakeBanner({
  banner_content: "test banner",
  location_filter: () => (/start|infograph/).test(window.location.hash),
});

export { MakeBanner, TestBanner }
