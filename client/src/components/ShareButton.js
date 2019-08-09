import text from "./ShareButton.yaml";

import { ShareModal } from './ShareModal.js';

import { create_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';

import { Fragment } from 'react';

const text_maker = create_text_maker(text);


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
    } = this.props;

    return(
      <Fragment>
        <button onClick={() => this.toggleModal(true)} className={button_class_name}>
          <img 
            src={get_static_url("svg/share.svg")} 
            alt={button_description}
            title={button_description}
          />
        </button>
        <ShareModal 
          show={this.state.showModal} 
          closeModal={() => this.toggleModal(false)} 
          url={url}
          title={title}
        />
      </Fragment>
    );
  }
}

ShareButton.defaultProps = { button_description: text_maker("share") };