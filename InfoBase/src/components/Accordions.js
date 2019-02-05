import './Accordions.scss';
import { TransitionGroup } from 'react-transition-group';
import { get_static_url } from '../request_utils.js';

function FirstChild(props) {
  const childrenArray = React.Children.toArray(props.children);
  return childrenArray[0] || null;
}

const defaultMaxHeight = "300px";
class AccordionEnterExit extends React.Component {
  componentWillLeave(done){
    const node = ReactDOM.findDOMNode(this);
    const initialHeight = node.offsetHeight;
    const that = this;
  
    d3.select(node)
      .style('opacity', 1 )
      .style('max-height', initialHeight+'px')
      .transition()
      .ease(d3.easeLinear)
      .duration(this.props.collapseDuration)
      .style('opacity', 1e-6 )
      .style('max-height', '1px')
      .on('end',function(){
        if(!that.props.cancel && document.body.contains(node)){
          done();
        }
      });

  }
  componentWillEnter(done){
    const node = ReactDOM.findDOMNode(this);
    const that = this;
    d3.select(node)
      .style('max-height', "0px")
      .style('opacity', 1e-6)
      .transition()
      .ease(d3.easeLinear)
      .duration(this.props.expandDuration)
      .style( 'max-height', this.props.maxHeight || defaultMaxHeight )
      .style('opacity', '1')
      .on('end',function(){
        d3.select(node).style('max-height', 'none' );
        if(!that.props.cancel && document.body.contains(node)){
          done();
        }
      });

  }
  render(){
    return <this.props.component {...(_.omit(this.props, ['component', 'expandDuration', 'expandDuration', 'collapseDuration', 'cancel']))} />
  }
}


const StatelessPullDownAccordion = ({ title, isExpanded, children, onToggle }) => (
  <div className="pull-down-accordion">
    <div className="pull-down-accordion-header" onClick={onToggle}>
      { title }
    </div> 
    <TransitionGroup component={FirstChild}>
      { isExpanded && 
        <AccordionEnterExit
          component="div"
          className="pull-down-accordion-body"
          style={{paddingTop: "5px"}}
          expandDuration={600}
          collapseDuration={600}
        >
          {children}
        </AccordionEnterExit>
      }
    </TransitionGroup>
    <div className="pull-down-accordion-footer" onClick={onToggle}>
      <button 
        className="pull-down-accordion-expander"
        aria-label={isExpanded ? "collapse above" : "expand above"}
      >
        <span>
          <img 
            src={get_static_url("svg/chevron.svg")} 
            style={{ 
              width: "20px", 
              height: "20px",
              transform: isExpanded ? 'rotate(180deg)' : 'none',
            }} 
          />
        </span>

      </button>
    </div> 
  </div>
);


class AutoAccordion extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isExpanded: props.isInitiallyExpanded,
    }
  }
  render(){
    const { isExpanded } = this.state;
    return React.createElement(
      StatelessPullDownAccordion,
      { ...this.props, 
        isExpanded,
        onToggle: ()=> this.setState({ isExpanded: !isExpanded }),
      }
    );
  }
}

export {
  FirstChild,
  AccordionEnterExit,
  StatelessPullDownAccordion,
  AutoAccordion,
};