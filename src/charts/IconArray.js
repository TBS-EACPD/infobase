import { AutoSizer } from 'react-virtualized';
import { 
  layout as icon_layout,
  scale as icon_scale,
} from 'd3-iconarray';
import { shallowEqualObjectsOverKeys } from '../core/utils.js';

export const IconArray = props => (
  <AutoSizer>
    {({width}) => width &&
      <IconArray_
        width={width}
        {...props}
      />
    }
  </AutoSizer>
);

class IconArray_ extends React.Component {
  componentDidMount(){
    this._update();
  }
  componentDidUpdate(){
    this._update()
  }
  // shouldComponentUpdate(nextProps){
  //   return !shallowEqualObjectsOverKeys(this.props, nextProps, ['data', 'width', 'dotRadius']);
  // }
  render(){
    return (
      <div 
        ref={el => this.el = el} 
      />
    );
  }
  _update(){
    const { width, data, height, dotRadius } = this.props;
    const layout = icon_layout();

    const grid = layout(data);

    const arrayScale = icon_scale()
      .domain([ 0, layout.maxDimension(data.length) ])
      .range([0, width])

    

    this.el.innerHTML = "";

    const root = d3.select(this.el)
      .append('div')
      .style('position','relative')
      .style('overflow',"auto")
      .style('width',`${width}px`)
      .style('height',`${height}px`)

    root.selectAll('div')
      .data(grid)
      .enter()
      .append('div')
      .style('position','absolute')
      .style('overflow',"visible")
      //.attr('transform', d => `translate(${arrayScale(d.position.x)},${arrayScale(d.position.y)}` ) 
      .style('left',  d=> `${arrayScale(d.position.x)}px`)
      .style('top', d=> `${arrayScale(d.position.y)}px`)
      .call(function(parent){

        parent.append('div')
          .html(function(d){ return d.data; })
          .attr('color','#000')
          // .attr('stroke-width',8)
          // .attr('stroke-linejoin','round')
          // .attr('text-anchor','middle')
          .style('position','relative')
          .style('left',`${dotRadius}px`)
          .style('bottom',`${dotRadius*6/4}px`)

        // parent.append('text')
        //   .text(function(d){ return d.data; })
        //   .attr('fill','#FFF')
        //   .attr('text-anchor','middle')		
        //   .attr('y',dotRadius*6/4)
        //   .attr('x',dotRadius)	
      })


      //const lowest_element = _.maxBy(grid, 'y');

  }
}