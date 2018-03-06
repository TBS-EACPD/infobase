require('./bubble-menu.scss');
const classNames = require('classnames');

class BubbleMenu extends React.Component {

  render(){
    return (
      <div 
        style={{position:'relative'}}
      >
        <nav 
          ref="main" 
          className="bubble-menu"
        />
      </div>
    );
  }

  componentDidMount(){
    this._update(); 
  }

  componentDidUpdate(){
    this._update();
  }

  _update(){
    const sel =  d4.select(this.refs.main)
      .selectAll('a')
      .data(this.props.items)

    sel.enter()
      .append('a')
      .style('height', d => d.active ? '300px' : '150px' )
      .style('width', d => d.active ? '300px' : '150px' )
      

    sel
      .attr("class", d => classNames("link-unstyled centerer bubble-button", d.className,  d.active && "active"))
      .attr("href",_.property('href'))
      .html(d => get_html(d) ) 
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
