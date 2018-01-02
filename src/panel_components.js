//these components serve as an abstraction over the bootstrap panels
//eventually, they serve to completely replace the core/panel.js

class Panel extends React.Component {
  render(){
    return (
      <div 
        tabIndex="-1" 
        className="infograph-panel-container"
      >
        <section 
          id={this.props.id}
          className={"panel panel-info"} 
        >
          {this.props.children}      
        </section>
      </div>
    );
  }
} 

class PanelHeading extends React.Component {
  //expects   headerType prop e.g. 'h2', 'h3', etc. 
  render(){
    return (
      <header className="panel-heading">
        <div>
          { 
            React.createElement(
              this.props.headerType, 
              {className: 'panel-title'}, //added padding to fix the thing -StephenONeil
              this.props.children
            ) 
          }
        </div>
      </header>
    ); 
  }
}

class PanelBody extends React.Component {
  render(){
    return (
      <div className="panel-body">
        { this.props.children }
        <div className="clearfix" />
      </div>
    ); 
  }
}


class PanelText extends React.Component {
  render(){
    let klass = "col-sm-12 text "+ (this.props.colMd || "col-md-12")
    return (
      <div className={klass}>
        <div className="inner">
          {this.props.children}
        </div>
      </div>
    ); 
  }
}


class PanelGraphic extends React.Component {
  render(){
    let klass = "col-sm-12 graphic "+ (this.props.colMd || "col-md-12")
    return (
      <div className={klass}>
        <div className="fixed-inner">
          <div className="inner" style={{position:"relative"}} >
            {this.props.children}
            <div className="clearfix" />
          </div>
        </div>
      </div>
    ); 
  }
}

const PanelFooter = ({ children }) => <div className="panel-footer"> {children} </div>;


class PanelFootNote extends React.Component { 
  render(){
    return (
      null
    ); 
  }
}



module.exports = exports = {
  Panel,
  PanelBody,
  PanelHeading,
  PanelText,
  PanelGraphic,
  PanelFootNote,
  PanelFooter,
};
