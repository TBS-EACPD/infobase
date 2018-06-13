const {default: withRouter} =  require('react-router/withRouter');
const {formats} = require('./core/format.js');
const classNames = require('classnames');
const { 
  deptSearch, 
  everythingSearch,
} = require('./search/search.js');

const { 
  run_template,
  trivial_text_maker,
} = require('./models/text.js');

// Import utility components from the ./components directory, to be re-exported here for easy requiring in the InfoBase
const {
  FirstChild,
  AccordionEnterExit,
  StatelessPullDownAccordion,
  AutoAccordion,
} = require('./components/Accordions.js');

const { HeightClipper } = require('./components/HeightClipper.js');

const { RadioButtons } = require('./components/RadioButtons.js');

const { Select } = require('./components/Select.js');

const { SortIndicators } = require('./components/SortIndicators.js');

const { TabbedContent } = require('./components/TabbedContent.js');

const { LabeledBox } = require('./components/LabeledBox.js');

const { 
  TextMaker,
  TM,
} = require('./components/TextMaker.js');

const { TwoLevelSelect } = require('./components/TwoLevelSelect.js');

const { CardTopImage } = require('./components/CardTopImage.js');
const { CardLeftImage } = require('./components/CardLeftImage.js');
const { CardCenteredImage } = require('./components/CardCenteredImage.js');
const { CardBackgroundImage } = require('./components/CardBackgroundImage.js');

const { DebouncedTextInput } = require('./components/DebouncedTextInput.js');

const { abbrev } = require('./core/utils.js'); 



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
    {footnotes.map( (text,ix) => 
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

module.exports = {
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
  Abbrev,
}
