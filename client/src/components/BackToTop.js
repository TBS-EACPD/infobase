import './BackToTop.scss';
import { trivial_text_maker } from '../models/text.js';
import classNames from 'classnames';

export class BackToTop extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      shown: false,
      caught_by_footer: false,
    };

    this.handleScroll = this.handleScroll.bind(this);

    this.page_header = document.getElementById('ib-site-header-area');
    this.page_footer = document.getElementById('wb-info');
  }

  handleScroll(){
    const should_be_shown = window.pageYOffset > (this.page_header.offsetTop + this.page_header.offsetHeight);
    
    const should_be_caught = (window.innerWidth > 600) && (
      ( window.pageYOffset + window.innerHeight ) > (this.page_footer.offsetTop - 50)
    );

    this.setState({
      shown: should_be_shown,
      caught_by_footer: should_be_caught,
    });
  };

  componentDidMount(){
    window.addEventListener("scroll", this.handleScroll);

    // Resizing can reposition the page's scroll position without firing a scroll event, so watch for resizes too
    window.addEventListener("resize", this.handleScroll);
  }
  componentWillUnmount(){
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleScroll);
  }
  
  handleClick(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  render(){
    const {
      shown,
      caught_by_footer,
    } = this.state;
  
    return (
      <a 
        className={classNames(
          "back-to-top", 
          shown && 'back-to-top--shown',
          !caught_by_footer && 'back-to-top--fixed',
          caught_by_footer && 'back-to-top--caught'
        )}
        style={{
          top: caught_by_footer ? `${this.page_footer.offsetTop - 50}px` : "auto",
        }} 
        tabIndex='-1' 
        onClick={() => this.handleClick()}
      >
        {trivial_text_maker("back_to_top")}
      </a> 
    );
  }
}