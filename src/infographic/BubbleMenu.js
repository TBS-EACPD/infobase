import './BubbleMenu.scss';
import { classNames } from 'classnames';

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
            _.map(this.props.items, item => <a
              className={classNames( "centerer bubble-button", item.active && "active" )}
              style={{height: "200px", width: "300px"}}
              href={item.href}
            >
              <strong className='title bolder'> 
                {item.title}
              </strong>
            </a>
            )
          }
        </nav>
      </div>
    );
  }
}

export { BubbleMenu }
