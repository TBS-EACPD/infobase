require('./bubble-menu.css');
const classNames = require('classnames');

class BubbleMenu extends React.Component {

  render(){
    return (
      <div 
        style={{position:'relative'}}
      >
        <div 
          ref="main" 
          className="bubble-menu"
          aria-hidden={true}
        />
        <div className="sr-only">
          {this.a11y_content()}
        </div>
      </div>
    );
  }

  a11y_content(){
    const {
      items,
      onA11ySelect,
    } = this.props;

    return <ul>
      {_.map(items, item => 
        <li key={item.id}>
          <a 
            href="#" 
            onClick={ e => {
              e.preventDefault();
              onA11ySelect(item.id)
            }} 
            dangerouslySetInnerHTML={{
              __html: get_html(Object.assign({active:true}, item)),
            }}
          />
        </li>
      )}
    </ul>;
  }

  // I don<t need of of the two
  componentDidMount(){
    this._update(); 
  }

  componentDidUpdate(){
    this._update();
  }

  _update(){
    const {
      items,
      onClick,
    } = this.props;

    const sel =  d4.select(this.refs.main)
      .selectAll('button')
      .data(items)

    sel.enter()
      .append('button')
      .attr("class", d => classNames("button-unstyled centerer bubble-button", d.className,  d.active && "active"))
      .style('height', d => d.active ? '300px' : '150px' )
      .style('width', d => d.active ? '300px' : '150px' )
      

    sel
      .classed('active', d=> d.active)
      .html(d => get_html(d) ) 
      .on('click', item => {
        if(!item.active){
          onClick(item.id);
        }
      })
      .transition()
      .duration(300)
      .ease(d4.easeLinear)
      .style('height', d=> d.active ? '300px' : '150px' )
      .style('width', d=> d.active ? '300px' : '150px' );
  }
}

const get_html = ({description,title,active}) => ( 
  description && active ?    
  "<span class='sub-title'>"+description+"</span>" :
  "<strong class='title bolder'>"+title+"</strong>"  
);

module.exports = exports = {BubbleMenu}
