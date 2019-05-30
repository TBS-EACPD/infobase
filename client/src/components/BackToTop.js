import './BackToTop.scss' ;
import { trivial_text_maker } from '../models/text.js' ;

export class BackToTop extends React.Component {
  constructor(props) {
    super(props);

    this.buttonRef = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  handleScroll() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      this.buttonRef.current.classList.add('show') ;
    }
    else {
      this.buttonRef.current.classList.remove('show') ;
    }
    
    if (window.innerWidth > 600) {
      this.checkOffset();
    }
  };

  handleResize() {
    if (window.innerWidth < 600) {
      this.buttonRef.current.style.bottom = '0px';
      this.buttonRef.current.style.position = 'fixed';
      this.buttonRef.current.style.top = '';
    }
  }

  checkOffset() {
    if(this.buttonRef.current.offsetTop + window.pageYOffset >= document.getElementById('wb-info').offsetTop - 50) { 
      this.buttonRef.current.style.position = 'absolute';                   
      this.buttonRef.current.style.top = document.getElementById('wb-info').offsetTop - 50+'px';
      this.buttonRef.current.style.bottom = '';
    }
     
    if(document.documentElement.scrollTop + window.innerHeight < document.getElementById('wb-info').offsetTop) {
      this.buttonRef.current.style.position = 'fixed';
      this.buttonRef.current.style.bottom = '30px';
      this.buttonRef.current.style.top = '';
    }
  }

  handleClick() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  componentDidMount(){
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  }
  
  render() {
    return <a className="back-to-top" style={{backgroundColor: window.infobase_color_constants.primaryColor}} ref={this.buttonRef} tabIndex='-1' onClick={() => this.handleClick()}>{trivial_text_maker("back_to_top")}</a>
  }
  
}