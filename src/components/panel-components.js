import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FootnoteList, TM } from '../util_components.js';
import { Details } from '../components/Details.js';

export const Panel = ({ title, sources, footnotes, children, subtitle }) => (
  <section className='panel panel-info mrgn-bttm-md'>
    {title && <header className='panel-heading'>
      <header className="panel-title"> {title} </header>
      {subtitle &&
        <div className="panel-sub-title">
          {subtitle}
        </div>
      }
    </header>
    }
    <div className='panel-body'>
      { children }
      <div className="mrgn-tp-md" />
      {_.nonEmpty(sources) && 
        <div>
          <TM
            k="panel_source_t"
            args={{links: sources}}
          />
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
      if ( child.type && child.type.toString() === "Symbol(react.fragment)" ){
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
          style={ isGraph ? {position:"relative"} : null }
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

}

StdPanel.propTypes = {
  children: function (props) {
    const { children } = props;
    
    const are_children_valid = (children) => {
      const filtered_and_flattened_children = _.chain(children)
        .flatMap( child => {
          if ( child.type && child.type.toString() === "Symbol(react.fragment)" ){
            return child.props.children;
          } else {
            return child;
          }
        })
        .filter(_.identity)
        .value();

      return _.every(filtered_and_flattened_children, {type: Col});
    }

    if( !are_children_valid(children) ){
      return new Error(`StdPanel expects all children to be either of the type 'Col', a fragment containing children of type 'Col', or false (in the case of a conditional child component)`);
    }
  },
}

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
}