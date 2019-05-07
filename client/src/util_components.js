import classNames from 'classnames';
import { Fragment } from 'react';
import { run_template, trivial_text_maker, create_text_maker } from './models/text.js';
import { formats } from './core/format.js';

// Import utility components from the ./components directory, to be re-exported here for easy requiring in the InfoBase
import { FirstChild, AccordionEnterExit, StatelessPullDownAccordion, AutoAccordion } from './components/Accordions.js';
import { HeightClipper } from './components/HeightClipper.js';
import { RadioButtons } from './components/RadioButtons.js';
import { Select } from './components/Select.js';
import { SortIndicators } from './components/SortIndicators.js';
import { TabbedControls, TabbedContent } from './components/TabbedContent.js';
import { LabeledBox } from './components/LabeledBox.js';
import { TextMaker, TM } from './components/TextMaker.js';
import { TwoLevelSelect } from './components/TwoLevelSelect.js';
import { CardTopImage } from './components/CardTopImage.js';
import { CardLeftImage } from './components/CardLeftImage.js';
import { CardCenteredImage } from './components/CardCenteredImage.js';
import { CardBackgroundImage } from './components/CardBackgroundImage.js';
import { DebouncedTextInput } from './components/DebouncedTextInput.js';
import { ContainerEscapeHatch } from './components/ContainerEscapeHatch.js';
import { FilterTable } from './components/FilterTable.js';
import { Details } from './components/Details.js';
import { EmbeddedVideo } from './components/EmbeddedVideo.js';
import { SpinnerWrapper } from './components/SpinnerWrapper.js';
import { KeyConceptList } from './components/KeyConceptList.js';
import {
  UnlabeledTombstone,
  LabeledTombstone,
} from './components/Tombstones.js'


import { DeptSearch, DeptSearchWithoutRouter } from './search/DeptSearch.js';
import { EverythingSearch } from './search/EverythingSearch.js';
import { GlossarySearch } from './search/GlossarySearch.js';

import { 
  text_abbrev,
  sanitized_dangerous_inner_html,
} from './general_utils.js';

// Misc. utility components that don't justify having their own file in ./components, for various reasons

const ExternalLink = ({display, href}) => <a target="_blank" rel="noopener noreferrer" href={href}>{display}</a>;

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

const FancyUL = ({children, ul_class})=> (
  <ul className={classNames("fancy-ul", ul_class)}>
    { _.chain(children)
      .compact()
      .map((item,i) => (<li key={i}> {item} </li>))
      .value()
    }
  </ul>
);

const FootnoteList = ({ footnotes }) => <div style={{padding: "10px"}}>
  <ul>
    {_.chain(footnotes)
      .uniqBy("text")
      .map( ({text}, ix) => 
        <li key={ix}>
          <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(text)} />
        </li>
      )
      .value()
    }
  </ul>
</div>;

const Year = ({y}) => run_template(`{{${y}}}`);

const TextAbbrev = ({text, len}) => <div> { text_abbrev(text, len) } </div>;

const TrivialTM = props => <TM tmf={trivial_text_maker} {...props} />;
const TrivialTextMaker = props => <TextMaker text_maker_func={trivial_text_maker} {...props} />;
const create_text_maker_component = (text) => {
  const text_maker = create_text_maker(text);
  return {text_maker, TM: (props) => <TM tmf={text_maker} {...props}/>};
};

const DlItem = ({ term, def }) => (
  <Fragment>
    <dt> {term} </dt>
    <dd> {def} </dd>
  </Fragment>
);

export {
  FirstChild,
  AccordionEnterExit,
  StatelessPullDownAccordion,
  AutoAccordion,
  HeightClipper,
  TabbedControls,
  TabbedContent,
  LabeledBox,
  Format,
  FancyUL,
  DeptSearch,
  DeptSearchWithoutRouter,
  EverythingSearch,
  GlossarySearch,
  TextMaker,
  TM,
  TrivialTextMaker,
  TrivialTM,
  ExternalLink,
  lang,
  SpinnerWrapper,
  KeyConceptList,
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
  FilterTable,
  Details,
  EmbeddedVideo,
  ContainerEscapeHatch,
  UnlabeledTombstone,
  LabeledTombstone,
  TextAbbrev,
  create_text_maker_component,
  DlItem,
};
