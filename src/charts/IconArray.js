import { 
  layout as icon_layout,
  scale as icon_scale,
} from 'd3-iconarray';


const padding = 15;

export class IconArray extends React.Component {
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
      data,
      height,
      items_per_row,
      widthFirst,
      render_item,
    } = this.props;

    const width = this.el.offsetWidth;

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


export class FlexIconArray extends React.Component {
  render(){
    const { 
      render_item,
      items,
      heightFirst,
    } = this.props;

    const rendered_items = _.map(items, (item, ix) =>
      <div
        key={ix}
        style={{
          flex: "0 0 auto",
        }}
      >
        {render_item(item)}
      </div>
    );

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          alignContent: "flex-start",
          flexWrap: "wrap",
          flexDirection: heightFirst ? "column" : "row",
        }}
      >
        {rendered_items}
      </div>
    );
  }
}