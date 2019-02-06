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

    const aria_labels = {
      en: {
        open: "Content follows, activate to collapse content",
        closed: "Activate to expand content",
      },
      fr: {
        open: "Le contenu suit, activez pour réduire le contenu",
        closed: "Actiavte pour élargir le contenu",
      },
    };

    return <div className="IBDetails"> 
      <button
        className={classNames("IBDetails__Summary", isOpen && "IBDetails__Summary--open")}
        onClick={()=> this.setState({isOpen: !isOpen})}
        aria-label={aria_labels[window.lang][isOpen ? "open" : "closed"]}
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