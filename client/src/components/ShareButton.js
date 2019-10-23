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

import { StatelessModal } from './modals_and_popovers';
import { create_text_maker } from '../models/text.js';
import { IconShare } from '../icons/icons.js';
import { log_standard_event } from '../core/analytics.js';

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

      icon_color,
      icon_alternate_color,
      icon_size,

      analytics_logging,
      analytics_event_value,
    } = this.props;

    const log_share_event = () => {
      const site_shared_to = document.activeElement.getAttribute('aria-label');

      analytics_logging && log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
        MISC1: `SHARE_CONTENT--${site_shared_to}`,
        MISC2: analytics_event_value || url,
      });
    };

    return(
      <Fragment>
        <button onClick={() => this.toggleModal(true)} className={button_class_name}>
          <IconShare
            title={button_description}
            color={icon_color}
            alternate_color={icon_alternate_color}
            width={icon_size}
            height={icon_size}
          />
        </button>
        <StatelessModal 
          show={this.state.showModal} 
          on_close_callback={() => this.toggleModal(false)}
          title={
            <Fragment>
              <IconShare
                title={text_maker("share")}
                color={window.infobase_color_constants.tertiaryColor}
                alternate_color={false}
              />
              {text_maker("share")}
            </Fragment>
          }
          subtitle={title}
          body={
            <div 
              onClick={log_share_event}
              onKeyDown={({keyCode}) => _.includes([13,32], keyCode) && log_share_event()}
            >
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
            </div>
          }
          close_text={text_maker("cancel")}
        />
      </Fragment>
    );
  }
}

ShareButton.defaultProps = {
  button_description: text_maker("share"),
  icon_color: window.infobase_color_constants.textLightColor,
  icon_alternate_color: false,
};