const { PanelGraph } = require('../core/graphs.js');


class ReactPanelGraph extends React.Component {
  _render(){
    let {
      subject,
      graph_key,
      graph_options,
    } = this.props;  

    const { main } = this.refs;

    const graph_obj = PanelGraph.lookup(graph_key, subject.level)


    graph_options = graph_options || {};

    const calculations = graph_obj.calculate(subject, graph_options);

    if(!calculations){
      main.innerHTML = "";
      return;
    }
     
    graph_obj.render( d4.select(main), calculations, graph_options);

    
  }
  componentDidMount(){
    this._render();
  }
  componentDidUpdate(){
    this._render();
  }
  render(){
    const { graph_key } = this.props;
    return (
      <div 
        ref="main"
        id={graph_key}
        className="infograph-panel-container"
      />
    );
  }
}


module.exports = exports = {
  ReactPanelGraph,
};
