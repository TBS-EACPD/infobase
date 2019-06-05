import './BackToTop.scss';
import { trivial_text_maker } from '../models/text.js';
import classNames from 'classnames';

export class BackToTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shown: true,
      caught_by_footer: false,
    };

    this.buttonRef = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  handleScroll() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      this.buttonRef.current.classList.add('show');
    } else {
      this.buttonRef.current.classList.remove('show');
    }
    
    if (window.innerWidth > 600) {
      this.checkOffset();
    }
  };

  handleResize() {
    if (window.innerWidth < 600) {
      this.buttonRef.current.style.top = '';
    }
  }

  checkOffset() {
    if(this.buttonRef.current.offsetTop + window.pageYOffset >= document.getElementById('wb-info').offsetTop - 50) { 
      this.setState({
        caught_by_footer: true,
        shown: false,
      });
      this.buttonRef.current.style.top = document.getElementById('wb-info').offsetTop - 50+'px';
    }
     
    if((document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight < document.getElementById('wb-info').offsetTop) {
      this.setState({
        caught_by_footer: false,
        shown: true,
      });
      this.buttonRef.current.style.top = '';
    }
  }

  componentDidMount(){
    window.addEventListener("scroll", this.handleScroll);
    //window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    //window.removeEventListener("resize", this.handleResize);
  }
  
  handleClick() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  render() {
    const {
      shown,
      caught_by_footer,
    } = this.state;
  
    return (
      <a 
        className={classNames("back-to-top", shown && 'back-to-top--shown', caught_by_footer && 'back-to-top--caught')}
        style={{backgroundColor: window.infobase_color_constants.primaryColor}} 
        ref={this.buttonRef} 
        tabIndex='-1' 
        onClick={() => this.handleClick()}
      >
        {trivial_text_maker("back_to_top")}
      </a> 
    );
  }
}