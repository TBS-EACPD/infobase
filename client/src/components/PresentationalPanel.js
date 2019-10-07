import './PresentationalPanel.scss';
import text from './PresentationalPanel.yaml';

import classNames from 'classnames';

import { Details } from './Details.js';
import { 
  FootnoteList,
  create_text_maker_component,
} from './misc_util_components.js';


const { TM } = create_text_maker_component(text);

const PanelSource = ({links}) => {
  if(_.isEmpty(links)){
    return null;
  }
  const last_ix = links.length -1;
  return (
    <span>
      <span aria-hidden> 
        <TM k="source_link_text" />
      </span>
      <span className="sr-only"> <TM k="a11y_source_expl"/> </span>
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

export const PresentationalPanel = ({allowOverflow, title, otherHeaderContent, children, sources, footnotes }) => (
  <section className={classNames('panel panel-info mrgn-bttm-md', allowOverflow && "panel-overflow")}>
    { (title || otherHeaderContent) &&
      <header className='panel-heading'>
        { title && <h3 className="panel-title"> {title} </h3> }
        { otherHeaderContent }
      </header>
    }
    <div className='panel-body'>
      { children }
      <div className="mrgn-tp-md" />
      { _.nonEmpty(sources) && 
        <div>
          <PanelSource links={sources} />
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
  </section>
);