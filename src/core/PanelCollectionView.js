import withRouter from 'react-router/withRouter';

const { shallowEqualObjectsOverKeys } = require('./utils.js');
const { PanelGraph } = require('../core/PanelGraph.js');

export const ReactPanelGraph = withRouter(
  class ReactPanelGraph_ extends React.Component {
    render(){
      let {
        subject,
        graph_key,
        history,
      } = this.props;  

      const graph_obj = PanelGraph.lookup(graph_key, subject.level)

      const graph_options = {history};


      const calculations = graph_obj.calculate(subject, graph_options);

      if(!calculations){
        return null;
      }
      return <div id={graph_key}>
        {graph_obj.render(calculations, graph_options)}
      </div>

      
    }
    shouldComponentUpdate(nextProps){
      return !shallowEqualObjectsOverKeys(nextProps, this.props, ['subject','graph_key']);
    }
    
  }
);