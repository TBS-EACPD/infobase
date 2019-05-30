import './BackToTop.scss' ;
import text from "./BackToTop.yaml" ;
import { create_text_maker } from '../models/text.js' ;

const text_maker = create_text_maker(text);



export class BackToTop extends React.Component {
  constructor(props) {
    super(props);

    this.buttonRef = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      this.buttonRef.current.classList.add('show') ;
    }
    else {
      this.buttonRef.current.classList.remove('show') ;
    }
  };

  handleClick() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  componentDidMount(){
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  
  render() {
    return <a className="back-to-top" ref={this.buttonRef} tabIndex='-1' onClick={() => this.handleClick()}>{text_maker("back_to_top")}</a>
  }

  
}