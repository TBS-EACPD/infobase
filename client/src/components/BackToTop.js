import './BackToTop.scss' ;
//import glossary_text from '../glossary/glossary.yaml';
//import {create_text_maker_component} from '../util_components.js';

//const { text_maker } = create_text_maker_component(glossary_text);

window.onscroll = function() {handleScroll()} ;

function handleScroll() {
  if (document.documentElement.scrollTop > 300) {
    document.getElementById('button').classList.add('show') ;
  }
  else {
    document.getElementById('button').classList.remove('show') ;
  }
};

export class BackToTop extends React.Component {
  
  render() {
    return <a className="back-to-top" id="button" onClick={() => this.handleClick()}>Back to top</a>
  }

  handleClick() {
    document.documentElement.scrollTop = 0;
  }

}