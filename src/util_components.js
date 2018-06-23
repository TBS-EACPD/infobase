import { default as withRouter } from 'react-router/withRouter';
import classNames from 'classnames';
import { deptSearch, everythingSearch } from './search/search.js';
import { run_template, trivial_text_maker } from './models/text.js';
import { formats } from './core/format.js';

// Import utility components from the ./components directory, to be re-exported here for easy requiring in the InfoBase
import { FirstChild, AccordionEnterExit, StatelessPullDownAccordion, AutoAccordion } from './components/Accordions.js';
import { HeightClipper } from './components/HeightClipper.js';
import { RadioButtons } from './components/RadioButtons.js';
import { Select } from './components/Select.js';
import { SortIndicators } from './components/SortIndicators.js';
import { TabbedContent } from './components/TabbedContent.js';
import { LabeledBox } from './components/LabeledBox.js';
import { TextMaker, TM } from './components/TextMaker.js';
import { TwoLevelSelect } from './components/TwoLevelSelect.js';
import { CardTopImage } from './components/CardTopImage.js';
import { CardLeftImage } from './components/CardLeftImage.js';
import { CardCenteredImage } from './components/CardCenteredImage.js';
import { CardBackgroundImage } from './components/CardBackgroundImage.js';
import { DebouncedTextInput } from './components/DebouncedTextInput.js';
import { ContainerEscapeHatch } from './components/ContainerEscapeHatch.js';
import { abbrev } from './core/utils.js';



// Misc. utility components that don't justify having their own file in ./components, for various reasons

function lang(obj){ return obj[window.lang] || obj.text || "" }

class Format extends React.PureComponent {
  render(){
    const { 
      type, 
      content, 
    } = this.props;

    return <span 
      dangerouslySetInnerHTML={{__html: formats[type](content) }} 
    />;
  }
}

const DeptSearch = withRouter(
  class DeptSearch_ extends React.Component {
    render(){ return <div ref="main" /> }
    componentDidMount(){
      deptSearch(this.refs.main, this.props);
    }
  }
);

const EverythingSearch = withRouter(
  class EverythingSearch extends React.Component {
    render(){ return <div ref="main" /> }
    componentDidMount(){
      everythingSearch(this.refs.main, this.props);
    }
  }
);


class SpinnerWrapper extends React.Component {
  render(){ return <div ref="main" /> }
  componentDidMount(){ 
    const {scale} = this.props || {scale: 2};
    this.refs.main.appendChild( new Spinner({scale}).spin().el );
  }
}

const FancyUL = ({children, ul_class})=> (
  <ul className={classNames("fancy-ul", ul_class)}>
    { _.chain(children)
      .compact()
      .map((item,i) => (<li key={i}> {item} </li>))
      .value()
    }
  </ul>
);

const FootnoteList = ({ footnotes }) => <div style={{padding:"10px"}}>
  <ul>
    {footnotes.map( ({text},ix) => 
      <li key={ix}>
        <div dangerouslySetInnerHTML={{__html: text}} />
      </li>
    )}
  </ul>
</div>;

const Year = ({y}) => run_template(`{{${y}}}`);

const Abbrev = ({text,len}) => <span dangerouslySetInnerHTML={{__html: abbrev(text,len)}} />

const TrivialTM = props => <TM tmf={trivial_text_maker} {...props} />;
const TrivialTextMaker = props => <TextMaker text_maker_func={trivial_text_maker} {...props} />;

export {
  FirstChild,
  AccordionEnterExit,
  StatelessPullDownAccordion,
  AutoAccordion,
  HeightClipper,
  TabbedContent,
  LabeledBox,
  Format,
  FancyUL,
  DeptSearch,
  EverythingSearch,
  TextMaker,
  TM,
  TrivialTextMaker,
  TrivialTM,
  lang,
  SpinnerWrapper,
  Select,
  TwoLevelSelect,
  SortIndicators,
  RadioButtons,
  FootnoteList,
  Year,
  CardTopImage,
  CardLeftImage,
  CardCenteredImage,
  CardBackgroundImage,
  DebouncedTextInput,
  ContainerEscapeHatch,
  Abbrev,
};
