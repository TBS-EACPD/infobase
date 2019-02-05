import ReactDOM from 'react-dom';
class ReactContentRenderer {
  constructor(){
    this.nodes = []
  }
  render(component, node){
    ReactDOM.render(component, node)
    this.nodes.push(node);
  }
  unmountAll(){
    _.each(this.nodes, node => ReactDOM.unmountComponentAtNode(node) );
    this.nodes = [];
  }
}

const reactAdapter = new ReactContentRenderer();

export { reactAdapter, ReactContentRenderer };
