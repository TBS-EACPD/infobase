const { TM } = require('./TextMaker.js');

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
    
    // Logic for ensuring none of HeightClipper's children elements can take focus (when they can, tab nav can break things)
    // Going to present the steps in reverse, because they make more sense that way:
    //   Step 2) All focusable elements contained in the div classed .unfocusable_children (only classed this when clipped) are given a tabindex of -999.
    //   Step 1) All elements with tabindex -999 have their tab index removed.
    // NOTE: -999 is used so that this process won't end up unsetting the tabindex of something that was intended to stay untabable (i.e., as is standard, tabindex -1)
    // svg's dealt with separetly, becuase :focusable won't select them when they ARE focusable, and setting a negative tabindex does nothing to them.
    const thisNode = $(ReactDOM.findDOMNode(this));
    
    thisNode.find("[tabindex=-999]").removeAttr("tabindex");
    thisNode.find("svg").removeAttr("focusable");
    
    thisNode.find(".unfocusable_children").find("*:focusable").attr("tabindex","-999");
    thisNode.find(".unfocusable_children").find("svg").attr("focusable","false");
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
          <div className={ isClipped ? "unfocusable_children" : "" }>
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