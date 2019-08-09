import { ShareModal } from './ShareModal.js';

import { trivial_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';

export class ShareButton extends React.Component {
  constructor(props){
    super();

    this.state = {
      showModal: false,
    };
  }

  toggleModal(bool){
    this.setState({showModal: bool});
  }

  render(){
    const {
      url,
      button_class_name,
      title,
      button_description,
      subject,
    } = this.props;

    return(
      <div style={{display: 'inline'}}>
        <button onClick={() => this.toggleModal(true)} className={button_class_name}>
          <img src={get_static_url("svg/share.svg")} 
            alt={button_description}
            title={button_description}
          />
        </button>
        <ShareModal 
          show={this.state.showModal} 
          closeModal={() => this.toggleModal(false)} 
          url={url}
          title={title}
          subject={subject}
        />
      </div>
    );
  }
}

ShareButton.defaultProps = { button_description: trivial_text_maker("share") };