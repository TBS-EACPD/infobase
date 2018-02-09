import { AutoSizer } from 'react-virtualized';
import { 
  layout as icon_layout,
  scale as icon_scale,
} from 'd3-iconarray';

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


const padding = 15;

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
    let { 
      width,
      data,
      height,
      items_per_row,
      widthFirst,
      render_item,
    } = this.props;

    if(!width || !height){ 
      return;
    }
    const layout = icon_layout()
      .width(items_per_row)
      .widthFirst(widthFirst === false ? false : true);

    const grid = layout(data)

    const visualization_size = width-(2*padding);

    const arrayScale = icon_scale()
      .domain([ 0, layout.maxDimension(data.length) ])
      .range([0, visualization_size])

    const max_item_dimension = visualization_size/items_per_row;

    this.el.innerHTML = "";

    const root = d3.select(this.el)
      .append('div')
      .style('position','relative')
      .style('overflow',"auto")
      .style('width',`${width}px`)
      .style('height',`${height}px`)
      .style('padding', padding)

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
          .html( d=> render_item(d, max_item_dimension) )
          //.html(d => `<i class="fas fa-user"></i>`)
          //.html(d => `<div style="background-color:red;height:100%;width:100%;"></div>`)
          .attr('color','#000')
          .style('position','relative')


      })


      //const lowest_element = _.maxBy(grid, 'y');

  }
}