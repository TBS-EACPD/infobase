import './ShareButton.scss';
import text from "./ShareButton.yaml";

import { Fragment } from 'react';
import {
  TwitterShareButton,
  TwitterIcon,
  FacebookShareButton,
  FacebookIcon,
  EmailShareButton,
  EmailIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
} from 'react-share';

import { StatelessModal } from './StatelessModal.js';
import { create_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';

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
        <StatelessModal 
          show={this.state.showModal} 
          on_close_callback={() => this.toggleModal(false)}
          title={
            <Fragment>
              <img src={get_static_url('./svg/shareGrey.svg')} aria-hidden="true"/>
              {text_maker("share")}
            </Fragment>
          }
          subtitle={title}
          body={
            <Fragment>
              <FacebookShareButton className='share-icons' url={url}>
                <FacebookIcon size={32} />
              </FacebookShareButton> 
              <TwitterShareButton className='share-icons' url={url}>
                <TwitterIcon size={32} />
              </TwitterShareButton> 
              <EmailShareButton className='share-icons' url={url}> 
                <EmailIcon size={32} />
              </EmailShareButton>
              <LinkedinShareButton className='share-icons' url={url}>
                <LinkedinIcon size={32} />
              </LinkedinShareButton> 
              <RedditShareButton className='share-icons' url={url} title={title}>
                <RedditIcon size={32} />
              </RedditShareButton>
            </Fragment>
          }
          close_text={text_maker("cancel")}
        />
      </Fragment>
    );
  }
}

ShareButton.defaultProps = { button_description: text_maker("share") };