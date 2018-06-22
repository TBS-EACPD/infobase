import './BubbleMenu.scss';
import classNames from 'classnames';

class BubbleMenu extends React.Component {
  render(){
    return (
      <div 
        style={{position:'relative'}}
      >
        <nav 
          ref="main" 
          className="bubble-menu"
        >
          {
            _.map(this.props.items, item => (
              <a
                className={classNames( "centerer bubble-button", item.active && "active" )}
                style={{height: "200px", width: "300px"}}
                href={item.href}
                key={item.id}
              >
                <div className="bub-item">
                  <strong className="title" style={{width: "100%"}}> 
                    {item.title}
                  </strong>
                  <div className="bub-svg" dangerouslySetInnerHTML={{ __html: item.svg_content }}/>
                </div>
              </a>
            ))
          }
        </nav>
      </div>
    );
  }
}

export { BubbleMenu }
