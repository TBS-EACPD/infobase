import classNames from 'classnames';
import { Fragment } from 'react';

import { run_template, trivial_text_maker, create_text_maker } from '../models/text.js';
import { formats } from '../core/format.js';

import { text_abbrev } from '../general_utils.js';

import { TextMaker, TM } from './TextMaker.js';

// Misc. utility components that don't justify having their own file in ./components, for various reasons

const ExternalLink = ({children, href, title}) => <a target="_blank" rel="noopener noreferrer" href={href} title={title}>{children}</a>;

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

const banner_classes = ['info', 'success', 'warning', 'danger'];
const AlertBanner = ({children, banner_class, additional_class_names, style}) => {
  if ( banner_class && !_.includes(banner_classes, banner_class) ){
    throw `AlertBanner received invalid banner_class prop of ${banner_class}`;
  }

  const banner_class_name = `alert-${banner_class || 'info'}`;

  return (
    <div className={ `alert alert-no-symbol alert--is-bordered ${banner_class_name} ${additional_class_names}` } style={style}>
      { children }
    </div>
  );
};


export {
  Format,
  FancyUL,
  TrivialTextMaker,
  TrivialTM,
  ExternalLink,
  Year,
  TextAbbrev,
  lang,
  create_text_maker_component,
  DlItem,
  AlertBanner,
};