import text from './panel_base_text.yaml';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Fragment } from 'react';
import { 
  FootnoteList, 
  create_text_maker_component,
  SpinnerWrapper,
} from '../util_components.js';
import { Details } from '../components/Details.js';
import { get_static_url } from '../request_utils.js';
import { panel_href_template } from '../infographic/routes.js';
import { panel_context } from '../infographic/context.js';
import './panel-components.scss';
import { create_text_maker } from '../models/text.js';
import { PDFGenerator } from './PDFGenerator.js';


const { TM } = create_text_maker_component(text);
const text_maker = create_text_maker(text);

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



export const Panel = props => {
  const { Consumer } = panel_context;
  return (
    <Consumer>
      {(ctx)=>
        <Panel_
          context={ctx}
          {...props}
        />
      }
    </Consumer>
  );
};

class Panel_ extends React.Component {
  render(){
    const {
      context,
      title,
      sources,
      footnotes,
      children,
      allowOverflow,
    } = this.props;

    const file_name_context = context ? context.subject.level === 'dept' ? context.subject.acronym: context.subject.id : "";
    const file_name = `${file_name_context}_${title}.pdf`;
    const panel_link = context ? window.location.href.replace(window.location.hash,
      panel_href_template(context.subject, context.bubble, context.graph_key)) : null;  

    return (
      <section className={classNames('panel panel-info mrgn-bttm-md', allowOverflow && "panel-overflow")}>
        {title && <header className='panel-heading'>
          <header className="panel-title"> {title} </header>
          <div style={{marginLeft: 'auto'}}>
            { context && 
              <PDFGenerator 
                target_id={context.graph_key}
                file_name={file_name}
                title={title}
                link={panel_link}
                download_button_class_name={"panel-heading-utils panel-heading-btn"}
              />
            }
            {context && !window.feature_detection.is_IE() && generating_pdf &&
              <SpinnerWrapper config_name={"small_inline"} leaf={false} />
            }
            { context && !context.no_permalink && panel_href_template(context.subject, context.bubble, context.graph_key) && 
              <a href={panel_href_template(context.subject, context.bubble, context.graph_key)}>
                <img src={get_static_url("svg/permalink.svg")}
                  alt={text_maker("a11y_permalink")}
                  className='panel-heading-utils'
                  title={text_maker("a11y_permalink")}
                />
              </a>
            }
          </div>
        </header>
        }
        <div className='panel-body'>
          { children }
          <div className="mrgn-tp-md" />
          {_.nonEmpty(sources) && 
            <div>
              <PanelSource links={sources} />
            </div>
          }
          {_.nonEmpty(footnotes) && 
            <div className="mrgn-tp-md">
              <Details
                summary_content={ <TM k="footnotes" /> }
                content={
                  <FootnoteList
                    footnotes={footnotes}
                  />
                }
              />
            </div>
          }
        </div>
      </section>
    );
  }
}


/* 
  The below components allow to reduce some redundancy when addressing a particular use case: 
  
  A simple column split with vertically-centered content in each column.   

  Simply use 

  <StdPanel title footnotes sources>
    <Col size={12}>
      All children must be of type 'Col'. If you need non column based content, you must wrap it in a 12-sized Col
    </Col>
    <Col size={5}>
      {...first_col_content}
    </Col>
    <Col size={7}>
      {...first_col_content}
    </Col>
  </StdPanel>


*/


const Col = ({ children, size }) => null;

Col.propTypes = {
  size: PropTypes.number.isRequired,
  isText: PropTypes.bool,
  isGraph: PropTypes.bool,
};


//Dummy component that will be remapped to flexboxgrid columns 

const StdPanel = ({ title, sources, footnotes, children }) => {
  const mapped_children = _.chain(children)
    .flatMap( child => {
      if ( child.type && child.type === Fragment ){
        return child.props.children;
      } else {
        return child;
      }
    })
    .filter( child => child && child.type )
    .map( ({ props }, ix) => {
      const { size, isText, isGraph, extraClasses, passedRef } = props;
     
      return (
        <div 
          className={
            classNames(
              `fcol-xs-12 fcol-md-${size}`,
              isText && "medium_panel_text", 
              !_.isUndefined(extraClasses) && extraClasses
            )
          }
          style={ isGraph ? {position: "relative"} : null }
          key={ix}
          ref={passedRef}
        >
          {props.children}
        </div>
      );
    })
    .value();

  return (
    <Panel {...{title, sources, footnotes}}>
      <div className="frow middle-xs">
        {mapped_children}
      </div>
    </Panel>
  );

};

StdPanel.propTypes = {
  children: function (props) {
    const { children } = props;
    
    const are_children_valid = (children) => {
      const filtered_and_flattened_children = _.chain(children)
        .flatMap( child => {
          if ( child.type && child.type === Fragment ){
            return child.props.children;
          } else {
            return child;
          }
        })
        .filter(_.identity)
        .value();

      return _.every(filtered_and_flattened_children, {type: Col});
    };

    if( !are_children_valid(children) ){
      return new Error(`StdPanel expects all children to be either of the type 'Col', a fragment containing children of type 'Col', or false (in the case of a conditional child component)`);
    }
  },
};

export { Col, StdPanel};



/*
  shorthand for 
    <Panel>
      <div className="medium_panel_text">
        {children}
      </div>
    </Panel>
*/
export const TextPanel = props => {
  const { children } = props;
  const filtered_props = _.omit(props, "children");
  const new_children = <div className="medium_panel_text"> {children} </div>;
  return (
    <Panel {...filtered_props}>
      {new_children}
    </Panel>
  );
};