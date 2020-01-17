import './Panel.scss';
import text from './Panel.yaml';
import { GlossaryItem } from './glossary_components.js';

import classNames from 'classnames';

import { Details } from './Details.js';
import { FootnoteList } from './FootnoteList.js';
import { create_text_maker_component } from './misc_util_components.js';


const { TM } = create_text_maker_component(text);

const PanelSource = ({links}) => {
  if(_.isEmpty(links)){
    return null;
  }
  const last_ix = links.length -1;
  return (
    <span>
      <span aria-hidden> 
        <TM k="panel_source_link_text" />
      </span>
      <span className="sr-only"> <TM k="panel_a11y_source_expl"/> </span>
      <ul
        className="list-unstyled list-inline"
        style={{display: "inline"}}
      >
        {_.map(links, ({href, html},ix) =>
          <li key={ix}>
            <a
              className="source-link"
              href={href}
            >
              <span dangerouslySetInnerHTML={{__html: html}} />
            </a>{ix !== last_ix && ", "}
          </li>
        )}
      </ul>
    </span>
  );
};

const PanelGlossary = ({keys}) => {
  if(_.isEmpty(keys)){
    return null;
  }
  const last_ix = keys.length -1;
  return (
    <span>
      <TM k="panel_glossary_text" />
      <ul
        className="list-unstyled list-inline"
        style={{display: "inline"}}
      >
        {_.map(keys, (key,ix) =>
          <li key={ix}>
            <GlossaryItem id={key} item_class="glossary-link"/>
            {ix !== last_ix && ", "}
          </li>
        )}
      </ul>
    </span>
  );
};

export class Panel extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      isOpen: true,
    };
  }
  render(){
    const { isOpen } = this.state;
    const {
      allowOverflow,
      title,
      otherHeaderContent,
      children,
      sources,
      glossary_keys,
      footnotes,
    } = this.props;
    const label_id = _.uniqueId("IBDetails__a11yLabel");

    return (
      <section className={classNames('panel panel-info mrgn-bttm-md', allowOverflow && "panel-overflow")}>
        { (title || otherHeaderContent) &&
          <header className='panel-heading'>
            {
              <button
                className={classNames("panel-heading-utils")}
                onClick={()=> this.setState({isOpen: !isOpen})}
                aria-labelledby={label_id}
              >
                <span aria-hidden>
                  { isOpen ? "▼" : "►" }
                </span>
              </button>
            }
            { title && <h3 className="panel-title"> {title} </h3> }
            { isOpen && otherHeaderContent }
          </header>
        }
        { isOpen && 
          <div className='panel-body'>
            { children }
            <div className="mrgn-tp-md" />
            { _.nonEmpty(sources) && 
              <div>
                <PanelSource links={sources} />
              </div>
            }
            { _.nonEmpty(glossary_keys) && 
              <div className="mrgn-tp-md">
                <PanelGlossary keys={glossary_keys} />
              </div>
            }
            { _.nonEmpty(footnotes) && 
              <div className="mrgn-tp-md">
                <Details
                  summary_content={ <TM k="footnotes" /> }
                  content={ <FootnoteList footnotes={footnotes} /> }
                />
              </div>
            }
          </div>
        }
      </section>
    );
  }
}