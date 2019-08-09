import classNames from 'classnames';
import { Fragment } from 'react';

import { run_template, trivial_text_maker, create_text_maker } from '../models/text.js';
import { formats } from '../core/format.js';

import { 
  text_abbrev,
  sanitized_dangerous_inner_html,
} from '../general_utils.js';

import { TextMaker, TM } from './TextMaker.js';

// Misc. utility components that don't justify having their own file in ./components, for various reasons

const ExternalLink = ({display, href}) => <a target="_blank" rel="noopener noreferrer" href={href}>{display}</a>;

function lang(obj){ return obj[window.lang] || obj.text || ""; }

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
  Format,
  FancyUL,
  TrivialTextMaker,
  TrivialTM,
  ExternalLink,
  FootnoteList,
  Year,
  TextAbbrev,
  lang,
  create_text_maker_component,
  DlItem,
};