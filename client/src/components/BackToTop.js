import './BackToTop.scss' ;
import text from "./BackToTop.yaml" ;
import { create_text_maker } from '../models/text.js' ;

const text_maker = create_text_maker(text);

function handleScroll() {
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    document.getElementById('back-to-top-button').classList.add('show') ;
  }
  else {
    document.getElementById('back-to-top-button').classList.remove('show') ;
  }
};

export class BackToTop extends React.Component {
  
  render() {
    return <a className="back-to-top" id="back-to-top-button" tabIndex='-1' onClick={() => this.handleClick()}>{text_maker("back_to_top")}</a>
  }

  handleClick() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    document.querySelector(this.props.focus).focus();
  }

  componentDidMount(){
    window.addEventListener("scroll", handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", handleScroll);
  }
}