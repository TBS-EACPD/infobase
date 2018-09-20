import { TM } from './TextMaker.js';

/*props: 
  maxChildrenHeight as an INT of pixels,
  children : JSX (content to be clipped), 
  clipHeight: css height string,
*/
export class HeightClipper extends React.Component {
  constructor(){
    super();
    this.state = {
      exceedsHeight : null, 
      shouldClip: true,
    };
  }
  componentDidMount(){
    this.measureHeightAndUpdateState();
  }
  componentDidUpdate(){
    this.measureHeightAndUpdateState();
    
    const height_clipper_node = ReactDOM.findDOMNode(this);
    const untabbable_children_node = height_clipper_node.querySelector(".untabbable_children");

    // if the height clipper is collapsed it will have a div classed .untabbable_children,
    // do not want any of that node's children to be tab-selectable
    // if no .untabbable_children div, then need to reset the tabindex/focusable attributes of the height clipper children
    if (untabbable_children_node){
      untabbable_children_node
        .querySelectorAll("*")
        .forEach( node => {
          if ( !_.isUndefined(node.tabIndex) && !_.isNull(node.tabIndex) && node.tabIndex >= 0 ){
            node.setAttribute("prev-tabindex", node.tabIndex);
            node.setAttribute("tabindex", "-999");
          }
        });

      untabbable_children_node
        .querySelectorAll("svg")
        .forEach( node => node.setAttribute("focusable","false") );
    } else {
      height_clipper_node
        .querySelectorAll('[tabindex="-999"]')
        .forEach( node => node.removeAttribute("tabindex") );

      height_clipper_node
        .querySelectorAll("[prev-tabindex]")
        .forEach( node => {
          const previous_tabindex = node.getAttribute('prev-tabindex');
          node.setAttribute("tabindex", previous_tabindex);
          node.removeAttribute('prev-tabindex');
        });

      height_clipper_node
        .querySelectorAll("svg")
        .forEach( node => node.removeAttribute("focusable") );
    }
  }
  measureHeightAndUpdateState(){
    const {main} = this.refs;
    if(!this.state.exceedsHeight && this.state.shouldClip &&  main.offsetHeight > this.props.clipHeight){
      this.setState({ exceedsHeight: true });
    }
  }
  render(){
    const {
      clipHeight, 
      children,
      allowReclip,
      buttonTextKey,
      gradientClasses,
    } = this.props;
    const pixelClipHeight = clipHeight+"px";

    const { 
      exceedsHeight, 
      shouldClip,
    } = this.state;

    const isClipped = exceedsHeight && shouldClip;
  
    return (
      <div
        ref="main"
        style={{
          position: 'relative',
          maxHeight: isClipped && pixelClipHeight, 
          overflow: isClipped && 'hidden',
        }}
      >
        {isClipped &&
        <div 
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            top: '0px',
            left: '0px', 
            height: pixelClipHeight,
            cursor: 'pointer',
            zIndex:100,
          }}
          className={
            gradientClasses ? 
            gradientClasses :
            "gradient"
          }
          onClick={()=>{
            this.setState({shouldClip: false});
          }}
        >
          <button
            className="btn btn-ib-primary"
            style={{
              alignSelf: 'flex-end',
              height: '40px',  
              marginBottom: '10px',
            }}
            onClick={()=>{
              this.setState({shouldClip: false}, ()=> {
                this.refs.content.focus();
              });
            }}
          > 
            <TM k={ buttonTextKey || "show_text_content" } />
          </button>  
        </div>
        }
        <div 
          aria-hidden={!!isClipped}
          tabIndex={-1}
          ref="content"
        >
          <div className={ isClipped ? "untabbable_children" : "" }>
            {children}
          </div>
        </div>
        {allowReclip && exceedsHeight && !shouldClip &&
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            className="btn btn-ib-primary"
            style={{
              alignSelf: 'flex-end',
              height: '40px',  
              marginBottom: "20px",
              marginTop: "5px",
            }}
            onClick={()=>{
              this.setState({shouldClip: true});
            }}
          > 
            <TM k="hide_content" />
          </button>  
        </div>
        }
      </div>
    );
  }
}