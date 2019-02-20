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

    const label_id = _.uniqueId("IBDetails__a11yLabel");

    return <div className="IBDetails"> 
      <button
        className={classNames("IBDetails__Summary", isOpen && "IBDetails__Summary--open")}
        onClick={()=> this.setState({isOpen: !isOpen})}
        aria-labelledby={label_id}
      >
        <span aria-hidden className="IBDetails__TogglerIcon">
          { isOpen ? "▼" : "►" }
        </span>
        <span id={label_id}>
          { summary_content }
          <span className="sr-only">
            {aria_labels[window.lang][isOpen ? "open" : "closed"]}
          </span>
        </span>
      </button>
      <div className="IBDetails__Content">
        { isOpen && content}
      </div>
    </div>
  }

}