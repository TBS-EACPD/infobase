import classNames from 'classnames';
import './Details.scss';

export class Details extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isOpen: props.initialOpen || false,
    }
  }
  render(){
    const { summary_content, content } = this.props;
    const { isOpen } = this.state;

    return <div className="IBDetails"> 
      <button
        className={classNames("IBDetails__Summary", isOpen && "IBDetails__Summary--open")}
        onClick={()=> this.setState({isOpen: !isOpen})}
        aria-label={isOpen ? "content follows, active to collapse content": "Expand content" }
      >
        <span aria-disabled className="IBDetails__TogglerIcon">
          { isOpen ? "▼" : "►" }
        </span>
        { summary_content }
      </button>
      <div className="IBDetails__Content">
        { isOpen && content}
      </div>
    </div>
  }

}