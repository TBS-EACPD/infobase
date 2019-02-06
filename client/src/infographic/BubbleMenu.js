import './BubbleMenu.scss';
import classNames from 'classnames';

class BubbleMenu extends React.Component {
  render(){
    return (
      <div 
        style={{position: 'relative'}}
      >
        <nav 
          ref="main" 
          className="bubble-menu"
        >
          {
            _.map(this.props.items, item => (
              <a
                className={classNames( "centerer bubble-button", item.active && "active" )}
                href={item.href}
                key={item.id}
              >
                <div className="bub-item">
                  <strong className="title"> 
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
